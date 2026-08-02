import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import type Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { syncStripeSubscription } from '@/lib/sync-stripe-subscription'

async function syncInvoiceSubscription(invoice: Stripe.Invoice) {
  const subscriptionReference = invoice.parent?.subscription_details?.subscription
  const subscriptionId = typeof subscriptionReference === 'string'
    ? subscriptionReference
    : subscriptionReference?.id

  if (!subscriptionId) return
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await syncStripeSubscription(subscription)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Webhook configuration missing' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const checkout = event.data.object as Stripe.Checkout.Session
        const userId = checkout.client_reference_id
        const subscriptionId =
          typeof checkout.subscription === 'string'
            ? checkout.subscription
            : checkout.subscription?.id

        if (!userId || !subscriptionId) {
          throw new Error('Completed Checkout session is missing its account or subscription')
        }

        const subscription = await stripe.subscriptions.retrieve(subscriptionId)
        await syncStripeSubscription(subscription, userId)
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        await syncStripeSubscription(event.data.object as Stripe.Subscription)
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        await syncInvoiceSubscription(invoice)
        const customerId =
          typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id

        if (customerId) {
          const user = await prisma.user.findFirst({
            where: { stripeCustomerId: customerId },
            select: { id: true },
          })
          if (user) console.warn(`Stripe payment failed for user ${user.id}`)
        }
        break
      }

      case 'invoice.paid': {
        await syncInvoiceSubscription(event.data.object as Stripe.Invoice)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler failed:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
