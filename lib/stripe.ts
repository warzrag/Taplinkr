import Stripe from 'stripe'

// Temporairement désactivé pour le déploiement initial
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_disabled'

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2025-06-30.basil',
  typescript: true,
})

// Configuration des prix
export const PRICING_PLANS = {
  standard: {
    name: 'Standard',
    priceId: process.env.STRIPE_STANDARD_PRICE_ID || '',
    price: 9.99,
    currency: 'eur',
    interval: 'month' as const,
    features: [
      'Unlimited mobile-first bio pages',
      '50 tap-optimized links per page',
      'Mobile themes and animations',
      'HD profile and cover images',
      'Real-time online status',
      'Visitor location insights',
      'One-tap direct links',
      'Detailed mobile analytics',
      'Teams of up to 10 members',
      'Priority support'
    ]
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    price: 24.99,
    currency: 'eur',
    interval: 'month' as const,
    features: [
      'Everything in Standard',
      'Unlimited links with micro-interactions',
      'Custom icons and tap animations',
      'Native social media integrations',
      'Premium fonts, colors, and themes',
      'Advanced mobile animations',
      'Shield anti-bot protection',
      'Real-time analytics and tap heatmaps',
      'Teams of up to 10 members',
      '24/7 VIP support'
    ]
  }
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: 'standard' | 'premium',
  successUrl: string,
  cancelUrl: string
) {
  const priceId = PRICING_PLANS[plan].priceId
  
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`)
  }

  const session = await stripe.checkout.sessions.create({
    customer_email: userEmail,
    client_reference_id: userId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
  })

  return session
}

export async function createPortalSession(customerId: string, returnUrl: string) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function cancelSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}

export async function getSubscription(subscriptionId: string) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}
