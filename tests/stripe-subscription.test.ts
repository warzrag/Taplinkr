import { describe, expect, it } from 'vitest'
import type Stripe from 'stripe'
import { planFromPriceId, subscriptionHasAccess } from '../lib/stripe-subscription'

describe('Stripe subscription access', () => {
  const priceIds = { standard: 'price_standard', premium: 'price_premium' }

  it('maps configured Stripe prices to plans', () => {
    expect(planFromPriceId('price_standard', priceIds)).toBe('standard')
    expect(planFromPriceId('price_premium', priceIds)).toBe('premium')
    expect(planFromPriceId('price_unknown', priceIds)).toBe('free')
    expect(planFromPriceId(undefined, priceIds)).toBe('free')
  })

  it.each(['active', 'trialing', 'past_due'] satisfies Stripe.Subscription.Status[])(
    'keeps access while a subscription is %s',
    (status) => {
      expect(subscriptionHasAccess(status)).toBe(true)
    }
  )

  it.each(['canceled', 'incomplete', 'incomplete_expired', 'paused', 'unpaid'] satisfies Stripe.Subscription.Status[])(
    'removes access while a subscription is %s',
    (status) => {
      expect(subscriptionHasAccess(status)).toBe(false)
    }
  )
})
