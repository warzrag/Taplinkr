import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, PRICING_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['standard', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL
    if (!appUrl) return NextResponse.json({ error: 'Missing APP_URL configuration' }, { status: 500 })
    const origin = new URL(appUrl).origin
    const successUrl = `${origin}/dashboard/billing?success=true&plan=${plan}`
    const cancelUrl = `${origin}/pricing`

    // Créer la session Stripe Checkout
    const checkoutSession = await createCheckoutSession(
      session.user.id,
      session.user.email!,
      plan,
      successUrl,
      cancelUrl
    )

    return NextResponse.json({ 
      url: checkoutSession.url,
      sessionId: checkoutSession.id 
    })
  } catch (error) {
    console.error('Erreur lors de la création de la session Stripe:', error)
    return NextResponse.json(
      { error: 'Unable to start checkout' },
      { status: 500 }
    )
  }
}
