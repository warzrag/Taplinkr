import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.client_reference_id!
        const plan = session.metadata?.plan as 'standard' | 'premium'

        // Mettre à jour l'utilisateur avec le nouveau plan
        await prisma.user.update({
          where: { id: userId },
          data: {
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            planExpiresAt: null, // L'abonnement est maintenant géré par Stripe
          }
        })

        console.log(`User ${userId} upgraded to ${plan} plan`)
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Trouver l'utilisateur par l'ID de souscription
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (user) {
          // Déterminer le plan basé sur le prix
          const priceId = subscription.items.data[0].price.id
          let plan: 'free' | 'standard' | 'premium' = 'free'
          
          if (priceId === process.env.STRIPE_STANDARD_PRICE_ID) {
            plan = 'standard'
          } else if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
            plan = 'premium'
          }

          // Mettre à jour le plan de l'utilisateur
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan,
              planExpiresAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null
            }
          })

          console.log(`User ${user.id} subscription updated to ${plan}`)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        
        // Trouver l'utilisateur par l'ID de souscription
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: subscription.id }
        })

        if (user) {
          // Rétrograder au plan gratuit
          await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'free',
              stripeSubscriptionId: null,
              planExpiresAt: null
            }
          })

          console.log(`User ${user.id} subscription cancelled, downgraded to free`)
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Trouver l'utilisateur par l'ID client
        const user = await prisma.user.findFirst({
          where: { stripeCustomerId: invoice.customer as string }
        })

        if (user) {
          // Vous pouvez envoyer un email à l'utilisateur ici
          console.log(`Payment failed for user ${user.id}`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler failed:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}