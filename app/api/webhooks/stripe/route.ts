import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || ''

export async function POST(request: NextRequest) {
  // Si Stripe n'est pas configuré, retourner OK
  if (!stripe || !webhookSecret || webhookSecret.startsWith('whsec_...')) {
    return NextResponse.json({ received: true })
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
    }

    // Gérer les différents types d'événements
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('Checkout completed:', session.id)
  
  const userId = session.metadata?.userId
  const planType = session.metadata?.planType as 'FREE' | 'PRO' | 'ENTERPRISE'

  if (!userId || !planType) {
    console.error('Missing metadata in checkout session')
    return
  }

  // Mettre à jour le plan de l'utilisateur
  await prisma.user.update({
    where: { id: userId },
    data: {
      planType: planType,
      monthlyClicksLimit: planType === 'PRO' ? 10000 : planType === 'ENTERPRISE' ? -1 : 1000,
      linksLimit: planType === 'PRO' ? 100 : planType === 'ENTERPRISE' ? -1 : 5
    }
  })
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('Subscription created:', subscription.id)
  
  const userId = subscription.metadata?.userId
  const planType = subscription.metadata?.planType as 'FREE' | 'PRO' | 'ENTERPRISE'

  if (!userId || !planType) {
    console.error('Missing metadata in subscription')
    return
  }

  // Créer l'enregistrement de subscription
  await prisma.subscription.create({
    data: {
      userId: userId,
      stripeSubscriptionId: subscription.id,
      stripePriceId: subscription.items.data[0].price.id,
      status: subscription.status === 'active' ? 'ACTIVE' : 
              subscription.status === 'trialing' ? 'TRIALING' :
              subscription.status === 'past_due' ? 'PAST_DUE' :
              subscription.status === 'canceled' ? 'CANCELLED' : 'INCOMPLETE',
      planType: planType,
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('Subscription updated:', subscription.id)
  
  // Mettre à jour la subscription existante
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status === 'active' ? 'ACTIVE' : 
              subscription.status === 'trialing' ? 'TRIALING' :
              subscription.status === 'past_due' ? 'PAST_DUE' :
              subscription.status === 'canceled' ? 'CANCELLED' : 'INCOMPLETE',
      currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
      currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('Subscription deleted:', subscription.id)
  
  const userId = subscription.metadata?.userId

  // Marquer la subscription comme annulée
  await prisma.subscription.updateMany({
    where: { stripeSubscriptionId: subscription.id },
    data: { status: 'CANCELLED' }
  })

  if (userId) {
    // Remettre l'utilisateur au plan gratuit
    await prisma.user.update({
      where: { id: userId },
      data: {
        planType: 'FREE',
        monthlyClicksLimit: 1000,
        linksLimit: 5
      }
    })
  }
}

async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('Invoice payment succeeded:', invoice.id)
  
  if ((invoice as any).subscription) {
    // Récupérer la subscription
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string)
    const userId = subscription.metadata?.userId

    if (userId) {
      // Remettre les compteurs à zéro pour le nouveau cycle
      await prisma.user.update({
        where: { id: userId },
        data: { monthlyClicks: 0 }
      })
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  console.log('Invoice payment failed:', invoice.id)
  
  if ((invoice as any).subscription) {
    // Marquer la subscription comme en retard de paiement
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: (invoice as any).subscription as string },
      data: { status: 'PAST_DUE' }
    })
  }
}