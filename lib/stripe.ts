import Stripe from 'stripe'

// Temporairement désactivé pour le déploiement initial
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_disabled'

export const stripe = new Stripe(STRIPE_KEY, {
  apiVersion: '2024-11-20.acacia',
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
      'Pages bio illimitées mobile-first',
      '50 liens par page optimisés tap',
      'Thèmes et animations mobiles',
      'Images de profil et bannière HD',
      'Statut en ligne temps réel',
      'Géolocalisation des visiteurs',
      'Liens directs one-tap',
      'Analytics mobile détaillées',
      'Équipe jusqu\'à 10 membres',
      'Support prioritaire'
    ]
  },
  premium: {
    name: 'Premium',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || '',
    price: 24.99,
    currency: 'eur',
    interval: 'month' as const,
    features: [
      'Tout du plan Standard',
      'Liens illimités avec micro-interactions',
      'Icônes personnalisées et animations tap',
      'Intégration réseaux sociaux native',
      'Polices, couleurs et thèmes premium',
      'Animations mobiles avancées',
      'Protection Shield anti-bot',
      'Analytics temps réel + heatmap des taps',
      'Équipe jusqu\'à 10 membres',
      'Support VIP 24/7'
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