import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { planFromSubscription, subscriptionEndDate } from '@/lib/stripe-subscription'

function stripeId(value: string | { id: string } | null): string | null {
  return typeof value === 'string' ? value : value?.id ?? null
}

export async function syncStripeSubscription(
  subscription: Stripe.Subscription,
  expectedUserId?: string
) {
  const customerId = stripeId(subscription.customer)

  const user = expectedUserId
    ? await prisma.user.findUnique({ where: { id: expectedUserId } })
    : await prisma.user.findFirst({
        where: {
          OR: [
            { stripeSubscriptionId: subscription.id },
            ...(customerId ? [{ stripeCustomerId: customerId }] : []),
          ],
        },
      })

  if (!user) return null

  const plan = planFromSubscription(subscription)
  const removeSubscription = subscription.status === 'canceled'

  return prisma.user.update({
    where: { id: user.id },
    data: {
      plan,
      stripeCustomerId: customerId ?? user.stripeCustomerId,
      stripeSubscriptionId: removeSubscription ? null : subscription.id,
      planExpiresAt: subscriptionEndDate(subscription),
    },
  })
}
