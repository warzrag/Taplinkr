import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cancelSubscription } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec l'ID de souscription
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeSubscriptionId: true }
    })

    if (!user?.stripeSubscriptionId) {
      return NextResponse.json({ error: 'Aucune souscription trouvée' }, { status: 404 })
    }

    // Annuler la souscription à la fin de la période
    const subscription = await cancelSubscription(user.stripeSubscriptionId)

    return NextResponse.json({ 
      success: true,
      cancel_at_period_end: subscription.cancel_at_period_end,
      current_period_end: subscription.current_period_end
    })
  } catch (error) {
    console.error('Erreur lors de l\'annulation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de la souscription' },
      { status: 500 }
    )
  }
}