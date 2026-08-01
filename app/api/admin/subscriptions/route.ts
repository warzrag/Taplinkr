import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        plan: true,
        planExpiresAt: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        createdAt: true,
        _count: { select: { links: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    const summary = users.reduce((acc: Record<string, number>, user: any) => {
      const plan = user.plan === 'standard' || user.plan === 'premium' ? user.plan : 'free'
      acc[plan] = (acc[plan] || 0) + 1
      if (user.stripeSubscriptionId) acc.stripe += 1
      else if (plan !== 'free') acc.complimentary += 1
      return acc
    }, { free: 0, standard: 0, premium: 0, stripe: 0, complimentary: 0 })

    return NextResponse.json({ users, summary })
  } catch (error) {
    console.error('Admin subscriptions failed:', error)
    return NextResponse.json({ error: 'Unable to load subscriptions' }, { status: 500 })
  }
}
