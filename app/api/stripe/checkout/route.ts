import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, createPortalSession, stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { syncStripeSubscription } from '@/lib/sync-stripe-subscription'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['standard', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL
    if (!appUrl) return NextResponse.json({ error: 'Missing APP_URL configuration' }, { status: 500 })
    const origin = new URL(appUrl).origin
    const successUrl = `${origin}/dashboard/billing?success=true&session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/pricing`

    let customerId = user.stripeCustomerId
    let existingSubscription = null

    if (user.stripeSubscriptionId) {
      try {
        existingSubscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId)
        customerId =
          typeof existingSubscription.customer === 'string'
            ? existingSubscription.customer
            : existingSubscription.customer.id
      } catch (error) {
        if ((error as { code?: string }).code !== 'resource_missing') throw error
        await prisma.user.update({
          where: { id: session.user.id },
          data: { stripeSubscriptionId: null },
        })
      }
    }

    if (!existingSubscription && customerId) {
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all',
        limit: 10,
      })
      existingSubscription = subscriptions.data.find(
        (subscription) =>
          subscription.status !== 'canceled' &&
          subscription.status !== 'incomplete_expired'
      ) ?? null
    }

    if (existingSubscription && customerId) {
      await syncStripeSubscription(existingSubscription, session.user.id)
      const portalSession = await createPortalSession(
        customerId,
        `${origin}/dashboard/billing`
      )
      return NextResponse.json({ url: portalSession.url, mode: 'portal' })
    }

    const checkoutSession = await createCheckoutSession(
      session.user.id,
      user.email,
      plan,
      successUrl,
      cancelUrl,
      customerId
    )

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error)
    return NextResponse.json(
      { error: 'Unable to start checkout' },
      { status: 500 }
    )
  }
}
