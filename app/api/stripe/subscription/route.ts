import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { syncStripeSubscription } from '@/lib/sync-stripe-subscription'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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
    const syncedUser = await syncStripeSubscription(subscription, session.user.id)

    return NextResponse.json({
      subscription: {
        id: subscription.id,
        status: subscription.status,
        plan: syncedUser?.plan ?? 'free',
        cancel_at_period_end: subscription.cancel_at_period_end,
        current_period_end: subscription.items.data[0]?.current_period_end ?? null,
        current_period_start: subscription.items.data[0]?.current_period_start ?? null,
        created: subscription.created,
      },
    })
  } catch (error) {
    console.error('Unable to retrieve Stripe subscription:', error)
    if ((error as { code?: string }).code === 'resource_missing') {
      const session = await getServerSession(authOptions)
      if (session?.user?.id) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeSubscriptionId: null },
        })
      }
      return NextResponse.json({ subscription: null })
    }
    return NextResponse.json(
      { error: 'Unable to load subscription details' },
      { status: 503 }
    )
  }
}
