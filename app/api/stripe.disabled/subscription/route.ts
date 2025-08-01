import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec l'ID de souscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ subscription: null })
    }

    // Récupérer les détails de la souscription depuis Stripe
    const subscription = await getSubscription(user.stripeSubscriptionId)

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end,
      current_period_start: subscription.current_period_start,
      created: subscription.created,
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la souscription:', error)
    return NextResponse.json({ subscription: null })
  }
}