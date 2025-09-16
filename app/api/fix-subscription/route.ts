import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { stripe } from '@/lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id || session.user.email !== 'florent.media2@gmail.com') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer la subscription depuis Stripe
    const subscription = await stripe.subscriptions.retrieve('sub_1S888ABsZsV0a9NThqDtD526')
    
    // Déterminer le plan
    const priceId = subscription.items.data[0]?.price.id
    let plan = 'free'
    
    if (priceId === 'price_1S87zKBsZsV0a9NT4HFZEupT') {
      plan = 'standard'
    } else if (priceId === 'price_1S880DBsZsV0a9NTobYRFlSt') {
      plan = 'premium'
    }
    
    // Calculer la date d'expiration
    const planExpiresAt = new Date(subscription.current_period_end * 1000)

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        stripeCustomerId: 'cus_T4GfxRNAtdmERd',
        stripeSubscriptionId: 'sub_1S888ABsZsV0a9NThqDtD526',
        plan: plan,
        planExpiresAt: planExpiresAt
      }
    })

    return NextResponse.json({
      message: 'Abonnement réparé avec succès !',
      user: {
        plan: updatedUser.plan,
        planExpiresAt: updatedUser.planExpiresAt,
        stripeCustomerId: updatedUser.stripeCustomerId,
        stripeSubscriptionId: updatedUser.stripeSubscriptionId
      },
      subscription: {
        status: subscription.status,
        priceId: priceId
      }
    })
  } catch (error: any) {
    console.error('Erreur:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la réparation' },
      { status: 500 }
    )
  }
}