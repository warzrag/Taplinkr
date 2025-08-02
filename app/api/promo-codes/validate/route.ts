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

    // Rechercher le code promo
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        _count: {
          select: { promoRedemptions: true }
        },
        promoRedemptions: {
          where: { userId: session.user.id }
        }
      }
    })

    if (!promoCode) {
      return NextResponse.json(
        { error: 'Code promo invalide' },
        { status: 404 }
      )
    }

    // Vérifier si le code est actif
    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: 'Ce code promo n\'est plus actif' },
        { status: 400 }
      )
    }

    // Vérifier la date de validité
    if (promoCode.validUntil && new Date() > promoCode.validUntil) {
      return NextResponse.json(
        { error: 'Ce code promo a expiré' },
        { status: 400 }
      )
    }

    // Vérifier le nombre d'utilisations
    if (promoCode.maxUses && promoCode.currentUses >= promoCode.maxUses) {
      return NextResponse.json(
        { error: 'Ce code promo a atteint sa limite d\'utilisation' },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur a déjà utilisé ce code
    if (promoCode.promoRedemptions.length > 0) {
      return NextResponse.json(
        { error: 'Vous avez déjà utilisé ce code promo' },
        { status: 400 }
      )
    }

    // Vérifier le plan requis
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (promoCode.requiredPlan && user?.plan !== promoCode.requiredPlan) {
      return NextResponse.json(
        { error: `Ce code promo nécessite le plan ${promoCode.requiredPlan}` },
        { status: 400 }
      )
    }

    // Le code est valide
    return NextResponse.json({
      valid: true,
      discountType: promoCode.discountType,
      discountValue: promoCode.discountValue,
      description: promoCode.description
    })
  } catch (error) {
    console.error('Erreur lors de la validation du code promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}