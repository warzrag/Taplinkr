import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seul l'admin peut modifier les plans
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé - Seul l\'administrateur peut modifier les abonnements' },
        { status: 403 }
      )
    }

    const { plan, duration } = await request.json()

    // Vérifier que le plan est valide
    if (!['free', 'premium', 'business'].includes(plan)) {
      return NextResponse.json(
        { error: 'Plan invalide' },
        { status: 400 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Calculer la date d'expiration si une durée est fournie
    let planExpiresAt = null
    if (plan === 'premium' && duration) {
      planExpiresAt = new Date()
      planExpiresAt.setDate(planExpiresAt.getDate() + duration)
    }

    // Mettre à jour le plan
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { 
        plan,
        planExpiresAt: planExpiresAt
      }
    })

    // Envoyer un email de notification (optionnel)
    // TODO: Implémenter l'envoi d'email pour informer l'utilisateur

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: duration 
        ? `Abonnement Premium offert pour ${duration} jours`
        : plan === 'premium' 
        ? 'Abonnement Premium à vie activé'
        : 'Retour au plan gratuit'
    })
  } catch (error) {
    console.error('Erreur lors de la modification du plan:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}