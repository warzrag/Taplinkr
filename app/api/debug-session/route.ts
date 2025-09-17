import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
  }

  return NextResponse.json({
    user: {
      id: session.user.id,
      email: session.user.email,
      plan: session.user.plan,
      stripeCustomerId: session.user.stripeCustomerId,
      stripeSubscriptionId: session.user.stripeSubscriptionId,
      planExpiresAt: session.user.planExpiresAt
    }
  })
}