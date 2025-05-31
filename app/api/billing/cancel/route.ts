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

    // Récupérer la subscription active
    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        status: { in: ['ACTIVE', 'TRIALING'] }
      }
    })

    if (!subscription || !subscription.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Aucun abonnement actif trouvé' }, { status: 404 })
    }

    // Annuler la subscription sur Stripe (à la fin de la période)
    if (stripe) {
      await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
        cancel_at_period_end: true
      })
    }

    // Mettre à jour dans la base de données
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true }
    })

    return NextResponse.json({ message: 'Abonnement annulé avec succès' })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'annulation' }, { status: 500 })
  }
}