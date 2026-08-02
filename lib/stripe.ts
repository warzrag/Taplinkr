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
      'Unlimited tap-optimized links',
      'Mobile themes and animations',
      'HD profile and cover images',
      'Real-time online status',
      'Visitor location insights',
      'One-tap direct links',
      'Detailed mobile analytics',
      'Teams of up to 10 members',
      'Email support'
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
      'Custom domains with automatic HTTPS',
      'Unlimited links with micro-interactions',
      'Custom icons and tap animations',
      'Native social media integrations',
      'Premium fonts, colors, and themes',
      'Advanced mobile animations',
      'Shield anti-bot protection',
      'Real-time analytics and tap heatmaps',
      'Teams of up to 10 members',
      'Priority support'
    ]
  }
}

export function stripeConfiguration() {
  const missing = [
    ['STRIPE_SECRET_KEY', process.env.STRIPE_SECRET_KEY],
    ['STRIPE_STANDARD_PRICE_ID', process.env.STRIPE_STANDARD_PRICE_ID],
    ['STRIPE_PREMIUM_PRICE_ID', process.env.STRIPE_PREMIUM_PRICE_ID],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name)

  return { configured: missing.length === 0, missing }
}

export function assertStripeConfigured() {
  const configuration = stripeConfiguration()
  if (!configuration.configured) {
    throw new Error(`Stripe configuration is incomplete: ${configuration.missing.join(', ')}`)
  }
}

export async function createCheckoutSession(
  userId: string,
  userEmail: string,
  plan: 'standard' | 'premium',
  successUrl: string,
  cancelUrl: string,
  customerId?: string | null
) {
  assertStripeConfigured()
  const priceId = PRICING_PLANS[plan].priceId
  
  if (!priceId) {
    throw new Error(`Price ID not configured for plan: ${plan}`)
  }

  const session = await stripe.checkout.sessions.create({
    ...(customerId ? { customer: customerId } : { customer_email: userEmail }),
    client_reference_id: userId,
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    allow_promotion_codes: true,
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: {
        userId,
        plan,
      },
    },
  })

  return session
}

async function getPortalConfigurationId(returnUrl: string) {
  const existingConfigurations = await stripe.billingPortal.configurations.list({
    active: true,
    limit: 100,
  })
  const existing = existingConfigurations.data.find(
    (configuration) => configuration.metadata.taplinkrManaged === 'true'
  )
  if (existing) return existing.id

  const prices = await Promise.all([
    stripe.prices.retrieve(PRICING_PLANS.standard.priceId),
    stripe.prices.retrieve(PRICING_PLANS.premium.priceId),
  ])
  const pricesByProduct = new Map<string, string[]>()
  for (const price of prices) {
    const productId = typeof price.product === 'string' ? price.product : price.product.id
    pricesByProduct.set(productId, [...(pricesByProduct.get(productId) || []), price.id])
  }

  const configuration = await stripe.billingPortal.configurations.create({
    default_return_url: returnUrl,
    business_profile: {
      headline: 'Manage your Taplinkr subscription',
      privacy_policy_url: `${new URL(returnUrl).origin}/legal/privacy`,
      terms_of_service_url: `${new URL(returnUrl).origin}/legal/terms`,
    },
    features: {
      customer_update: {
        enabled: true,
        allowed_updates: ['email', 'name', 'address'],
      },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: {
        enabled: true,
        mode: 'at_period_end',
        cancellation_reason: {
          enabled: true,
          options: ['too_expensive', 'missing_features', 'switched_service', 'unused', 'other'],
        },
      },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ['price', 'promotion_code'],
        proration_behavior: 'create_prorations',
        products: Array.from(pricesByProduct, ([product, productPrices]) => ({
          product,
          prices: productPrices,
        })),
      },
    },
    metadata: { taplinkrManaged: 'true' },
  })

  return configuration.id
}

export async function createPortalSession(
  customerId: string,
  returnUrl: string,
  change?: { subscription: Stripe.Subscription; plan: 'standard' | 'premium' }
) {
  assertStripeConfigured()
  const configuration = await getPortalConfigurationId(returnUrl)
  const subscriptionItem = change?.subscription.items.data[0]
  const targetPrice = change ? PRICING_PLANS[change.plan].priceId : null
  const changingPrice = Boolean(
    change && subscriptionItem && targetPrice && subscriptionItem.price.id !== targetPrice
  )

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
    configuration,
    ...(changingPrice && change && subscriptionItem && targetPrice
      ? {
          flow_data: {
            type: 'subscription_update_confirm' as const,
            after_completion: {
              type: 'redirect' as const,
              redirect: { return_url: returnUrl },
            },
            subscription_update_confirm: {
              subscription: change.subscription.id,
              items: [{ id: subscriptionItem.id, price: targetPrice, quantity: 1 }],
            },
          },
        }
      : {}),
  })

  return session
}

export async function cancelSubscription(subscriptionId: string) {
  assertStripeConfigured()
  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  })

  return subscription
}

export async function getSubscription(subscriptionId: string) {
  assertStripeConfigured()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  return subscription
}
