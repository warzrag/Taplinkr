import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non connecté' })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        email: true,
        plan: true,
        planExpiresAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      }
    })

    return NextResponse.json({
      sessionUser: session.user,
      databaseUser: user,
      hasStripeCustomer: !!user?.stripeCustomerId,
      message: user?.stripeCustomerId 
        ? 'OK - Customer ID trouvé' 
        : 'PROBLÈME - Pas de Customer ID Stripe'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erreur' }, { status: 500 })
  }
}