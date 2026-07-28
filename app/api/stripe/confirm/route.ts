import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import type Stripe from 'stripe'
import { authOptions } from '@/lib/auth'
import { stripe } from '@/lib/stripe'
import { syncStripeSubscription } from '@/lib/sync-stripe-subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await request.json()
    if (typeof sessionId !== 'string' || !sessionId.startsWith('cs_')) {
      return NextResponse.json({ error: 'Invalid Checkout session' }, { status: 400 })
    }

    const checkout = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    if (checkout.client_reference_id !== session.user.id) {
      return NextResponse.json({ error: 'Checkout session does not belong to this account' }, { status: 403 })
    }

    if (!checkout.subscription || typeof checkout.subscription === 'string') {
      return NextResponse.json({ error: 'Subscription is not ready yet' }, { status: 409 })
    }

    const subscription = checkout.subscription as Stripe.Subscription
    const user = await syncStripeSubscription(subscription, session.user.id)
    if (!user || user.plan === 'free') {
      return NextResponse.json({ error: 'Payment is not active yet' }, { status: 409 })
    }

    return NextResponse.json({ success: true, plan: user.plan })
  } catch (error) {
    console.error('Unable to confirm Stripe Checkout:', error)
    return NextResponse.json({ error: 'Unable to confirm payment' }, { status: 500 })
  }
}
