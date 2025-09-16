import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, PRICING_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  const debugInfo: any = {
    hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
    nextAuthUrl: process.env.NEXTAUTH_URL || 'NOT SET',
    hasSession: false,
    sessionData: null,
    error: null
  }

  try {
    const session = await getServerSession(authOptions)
    debugInfo.hasSession = !!session
    debugInfo.sessionData = session ? { id: session.user?.id, email: session.user?.email } : null
    
    if (!session?.user?.id) {
      debugInfo.error = 'No session or user ID'
      return NextResponse.json({ debugInfo }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['standard', 'premium'].includes(plan)) {
      debugInfo.error = 'Invalid plan: ' + plan
      return NextResponse.json({ debugInfo }, { status: 400 })
    }

    // URLs de redirection - utiliser une valeur par défaut si NEXTAUTH_URL n'est pas défini
    const baseUrl = process.env.NEXTAUTH_URL || 'https://taplinkr.com'
    const successUrl = `${baseUrl}/dashboard/billing?success=true&plan=${plan}`
    const cancelUrl = `${baseUrl}/pricing`

    debugInfo.urls = { baseUrl, successUrl, cancelUrl }

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
      sessionId: checkoutSession.id,
      debugInfo
    })
  } catch (error: any) {
    debugInfo.error = error.message || 'Unknown error'
    debugInfo.errorType = error.type || 'Unknown type'
    debugInfo.errorStack = error.stack?.split('\n').slice(0, 3)
    
    return NextResponse.json(
      { debugInfo },
      { status: 500 }
    )
  }
}