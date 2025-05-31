import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { stripe, STRIPE_PLANS } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Si Stripe n'est pas configuré, retourner une erreur gracieuse
    if (!stripe || !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...')) {
      return NextResponse.json({ 
        error: 'Le système de paiement n\'est pas encore configuré. Contactez l\'administrateur.',
        code: 'STRIPE_NOT_CONFIGURED'
      }, { status: 503 })
    }

    const { planType, billingCycle } = await request.json()

    if (!planType || !STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS]) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Créer ou récupérer le customer Stripe
    let customerId = user.stripeCustomerId

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name || undefined,
        metadata: {
          userId: user.id
        }
      })
      
      customerId = customer.id

      // Sauvegarder l'ID customer
      await prisma.user.update({
        where: { id: user.id },
        data: { stripeCustomerId: customerId }
      })
    }

    const plan = STRIPE_PLANS[planType as keyof typeof STRIPE_PLANS]
    
    if (!plan.priceId) {
      return NextResponse.json({ error: 'Plan non disponible' }, { status: 400 })
    }

    // Créer la session de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'required',
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXTAUTH_URL}/dashboard?checkout=success`,
      cancel_url: `${process.env.NEXTAUTH_URL}/pricing?checkout=cancelled`,
      metadata: {
        userId: user.id,
        planType: planType
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planType: planType
        }
      },
      allow_promotion_codes: true,
      trial_period_days: planType === 'PRO' || planType === 'ENTERPRISE' ? 7 : undefined
    })

    return NextResponse.json({ url: checkoutSession.url })
  } catch (error: any) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création de la session de paiement' },
      { status: 500 }
    )
  }
}