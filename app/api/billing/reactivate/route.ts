import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la subscription
    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        cancelAtPeriodEnd: true
      }
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement à réactiver' }, { status: 404 })
    }

    // Réactiver la subscription sur Stripe
    if (stripe) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: false
      })
    }

    // Mettre à jour dans la base de données
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: false }
    })

    return NextResponse.json({ message: 'Abonnement réactivé avec succès' })
  } catch (error) {
    console.error('Reactivate subscription error:', error)
    return NextResponse.json({ error: 'Erreur lors de la réactivation' }, { status: 500 })
  }
}