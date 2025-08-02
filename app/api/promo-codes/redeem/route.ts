import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }

    const { code } = await request.json()

    if (!code) {
      return NextResponse.json(
        { error: 'Code promo manquant' },
        { status: 400 }
      )
    }

    // Commencer une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Rechercher le code promo avec verrouillage
      const promoCode = await tx.promoCode.findUnique({
        where: { code: code.toUpperCase() },
        include: {
          promoRedemptions: {
            where: { userId: session.user.id }
          }
        }
      })

      if (!promoCode || !promoCode.isActive) {
        throw new Error('Code promo invalide ou inactif')
      }

      // Vérifications (déjà faites dans validate, mais on refait pour sécurité)
      if (promoCode.validUntil && new Date() > promoCode.validUntil) {
        throw new Error('Code promo expiré')
      }

      if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
        throw new Error('Limite d\'utilisation atteinte')
      }

      if (promoCode.promoRedemptions.length > 0) {
        throw new Error('Code déjà utilisé')
      }

      // Récupérer l'utilisateur
      const user = await tx.user.findUnique({
        where: { id: session.user.id }
      })

      if (!user) {
        throw new Error('Utilisateur introuvable')
      }

      // Appliquer la promotion
      let updateData: any = {}
      
      if (promoCode.discountType === 'fixed_days') {
        // Ajouter des jours gratuits
        let baseDate = new Date()
        
        // Si l'utilisateur a déjà un plan premium actif, ajouter à partir de la date d'expiration
        if (user.plan === 'premium' && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()) {
          baseDate = new Date(user.planExpiresAt)
        }
        
        const newExpiry = new Date(baseDate)
        newExpiry.setDate(newExpiry.getDate() + promoCode.discountValue)
        
        updateData = {
          plan: 'premium',
          planExpiresAt: newExpiry
        }
      } else if (promoCode.discountType === 'percentage') {
        // Pour les pourcentages, on devrait normalement intégrer avec Stripe
        // Pour l'instant, on applique une réduction sur la durée
        const daysEquivalent = Math.round((promoCode.discountValue / 100) * 30) // 30 jours de base
        
        let baseDate = new Date()
        
        // Si l'utilisateur a déjà un plan premium actif, ajouter à partir de la date d'expiration
        if (user.plan === 'premium' && user.planExpiresAt && new Date(user.planExpiresAt) > new Date()) {
          baseDate = new Date(user.planExpiresAt)
        }
        
        const newExpiry = new Date(baseDate)
        newExpiry.setDate(newExpiry.getDate() + daysEquivalent)
        
        updateData = {
          plan: 'premium',
          planExpiresAt: newExpiry
        }
      }

      // Mettre à jour l'utilisateur
      const updatedUser = await tx.user.update({
        where: { id: session.user.id },
        data: updateData
      })

      // Créer l'enregistrement de rédemption
      await tx.promoRedemption.create({
        data: {
          promoCodeId: promoCode.id,
          userId: session.user.id
        }
      })

      // Incrémenter le compteur d'utilisation
      await tx.promoCode.update({
        where: { id: promoCode.id },
        data: { currentUses: { increment: 1 } }
      })

      return {
        success: true,
        message: promoCode.discountType === 'fixed_days' 
          ? `${promoCode.discountValue} jours Premium ajoutés à votre compte !`
          : `Réduction de ${promoCode.discountValue}% appliquée !`,
        newPlan: updatedUser.plan,
        newExpiry: updatedUser.planExpiresAt
      }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Erreur lors de l\'utilisation du code promo:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 400 }
    )
  }
}