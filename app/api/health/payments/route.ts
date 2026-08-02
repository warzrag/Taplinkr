import { NextResponse } from 'next/server'

import { PRICING_PLANS, stripe, stripeConfiguration } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

type Mode = 'live' | 'test' | 'unknown'

function keyMode(value: string | undefined, livePrefix: string, testPrefix: string): Mode {
  if (value?.startsWith(livePrefix)) return 'live'
  if (value?.startsWith(testPrefix)) return 'test'
  return 'unknown'
}

export async function GET() {
  const configuration = stripeConfiguration()
  const secretKeyMode = keyMode(process.env.STRIPE_SECRET_KEY, 'sk_live_', 'sk_test_')
  const publishableKeyMode = keyMode(
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    'pk_live_',
    'pk_test_'
  )

  if (!configuration.configured) {
    return NextResponse.json(
      {
        status: 'not_ready',
        mode: 'unknown',
        checks: {
          serverKey: secretKeyMode,
          publishableKey: publishableKeyMode,
          prices: 'not_configured',
          webhook: 'not_configured',
        },
      },
      { status: 503, headers: { 'Cache-Control': 'public, s-maxage=300' } }
    )
  }

  try {
    const [standardPrice, premiumPrice, webhookEndpoints] = await Promise.all([
      stripe.prices.retrieve(PRICING_PLANS.standard.priceId),
      stripe.prices.retrieve(PRICING_PLANS.premium.priceId),
      stripe.webhookEndpoints.list({ limit: 100 }),
    ])

    const standardReady =
      standardPrice.livemode &&
      standardPrice.active &&
      standardPrice.currency === 'eur' &&
      standardPrice.unit_amount === 999 &&
      standardPrice.recurring?.interval === 'month'
    const premiumReady =
      premiumPrice.livemode &&
      premiumPrice.active &&
      premiumPrice.currency === 'eur' &&
      premiumPrice.unit_amount === 2499 &&
      premiumPrice.recurring?.interval === 'month'

    const webhookReady = Boolean(process.env.STRIPE_WEBHOOK_SECRET) && webhookEndpoints.data.some(
      (endpoint) =>
        endpoint.livemode &&
        endpoint.status === 'enabled' &&
        endpoint.url.replace(/\/$/, '').endsWith('/api/stripe/webhook')
    )
    const liveMode = secretKeyMode === 'live' && publishableKeyMode === 'live'
    const ready = liveMode && standardReady && premiumReady && webhookReady

    return NextResponse.json(
      {
        status: ready ? 'ready' : 'not_ready',
        mode: liveMode ? 'live' : secretKeyMode === 'test' ? 'test' : 'mixed_or_unknown',
        checks: {
          serverKey: secretKeyMode,
          publishableKey: publishableKeyMode,
          standardPrice: standardReady ? 'ready' : 'invalid',
          premiumPrice: premiumReady ? 'ready' : 'invalid',
          webhook: webhookReady ? 'ready' : 'missing_or_disabled',
        },
      },
      {
        status: ready ? 200 : 503,
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
      }
    )
  } catch (error) {
    console.error('Payment readiness check failed:', error)
    return NextResponse.json(
      {
        status: 'not_ready',
        mode: secretKeyMode,
        checks: {
          serverKey: secretKeyMode,
          publishableKey: publishableKeyMode,
          prices: 'unavailable',
          webhook: 'unavailable',
        },
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
