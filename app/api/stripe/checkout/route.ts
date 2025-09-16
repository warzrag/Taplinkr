import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createCheckoutSession, PRICING_PLANS } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { plan } = body

    if (!plan || !['standard', 'premium'].includes(plan)) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // URLs de redirection - utiliser l'host de la requête pour supporter www et non-www
    const host = request.headers.get('host') || 'taplinkr.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const successUrl = `${protocol}://${host}/dashboard/billing?success=true&plan=${plan}`
    const cancelUrl = `${protocol}://${host}/pricing`

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
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}