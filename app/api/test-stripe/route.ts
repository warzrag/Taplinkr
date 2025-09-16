import { NextResponse } from 'next/server'
import { stripe, PRICING_PLANS } from '@/lib/stripe'

export async function GET() {
  const config = {
    hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
    hasStandardPriceId: !!process.env.STRIPE_STANDARD_PRICE_ID,
    hasPremiumPriceId: !!process.env.STRIPE_PREMIUM_PRICE_ID,
    standardPriceId: process.env.STRIPE_STANDARD_PRICE_ID || 'NOT SET',
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'NOT SET',
    standardPriceInConfig: PRICING_PLANS.standard.priceId || 'EMPTY',
    premiumPriceInConfig: PRICING_PLANS.premium.priceId || 'EMPTY',
  }

  // Test Stripe connection
  let stripeStatus = 'Not tested'
  try {
    const products = await stripe.products.list({ limit: 1 })
    stripeStatus = 'Connected successfully'
  } catch (error: any) {
    stripeStatus = `Error: ${error.message}`
  }

  return NextResponse.json({
    config,
    stripeStatus,
    message: 'Test API for debugging Stripe configuration'
  })
}