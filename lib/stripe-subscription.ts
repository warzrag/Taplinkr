import type Stripe from 'stripe'

export type BillingPlan = 'free' | 'standard' | 'premium'

export function planFromPriceId(
  priceId: string | null | undefined,
  priceIds = {
    standard: process.env.STRIPE_STANDARD_PRICE_ID,
    premium: process.env.STRIPE_PREMIUM_PRICE_ID,
  }
): BillingPlan {
  if (priceId && priceId === priceIds.standard) return 'standard'
  if (priceId && priceId === priceIds.premium) return 'premium'
  return 'free'
}

export function subscriptionHasAccess(status: Stripe.Subscription.Status): boolean {
  return status === 'active' || status === 'trialing' || status === 'past_due'
}

export function planFromSubscription(subscription: Stripe.Subscription): BillingPlan {
  if (!subscriptionHasAccess(subscription.status)) return 'free'
  return planFromPriceId(subscription.items.data[0]?.price.id)
}

export function subscriptionEndDate(subscription: Stripe.Subscription): Date | null {
  const timestamp =
    subscription.cancel_at ??
    (subscription.cancel_at_period_end
      ? subscription.items.data[0]?.current_period_end
      : null)

  return timestamp ? new Date(timestamp * 1000) : null
}
