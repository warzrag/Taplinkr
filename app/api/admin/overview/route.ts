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
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const [
      users,
      newUsers,
      links,
      activeLinks,
      linkTotals,
      paidUsers,
      domains,
      verifiedDomains,
      recentUsers,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.link.count(),
      prisma.link.count({ where: { isActive: true } }),
      prisma.link.aggregate({ _sum: { clicks: true, views: true } }),
      prisma.user.count({ where: { plan: { in: ['standard', 'premium'] } } }),
      prisma.customDomain.count(),
      prisma.customDomain.count({ where: { verified: true } }),
      prisma.user.findMany({
        select: { id: true, email: true, name: true, username: true, plan: true, emailVerified: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 6,
      }),
    ])

    return NextResponse.json({
      metrics: {
        users,
        newUsers,
        links,
        activeLinks,
        clicks: linkTotals?._sum?.clicks || 0,
        views: linkTotals?._sum?.views || 0,
        paidUsers,
        domains,
        verifiedDomains,
      },
      billing: {
        configured: Boolean(
          process.env.STRIPE_SECRET_KEY &&
          process.env.STRIPE_WEBHOOK_SECRET &&
          process.env.STRIPE_STANDARD_PRICE_ID &&
          process.env.STRIPE_PREMIUM_PRICE_ID
        ),
        secretKey: Boolean(process.env.STRIPE_SECRET_KEY),
        webhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        prices: Boolean(process.env.STRIPE_STANDARD_PRICE_ID && process.env.STRIPE_PREMIUM_PRICE_ID),
      },
      domains: {
        configured: Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID),
      },
      recentUsers,
    }, {
      headers: { 'Cache-Control': 'private, max-age=20' },
    })
  } catch (error) {
    console.error('Admin overview failed:', error)
    return NextResponse.json({ error: 'Unable to load admin overview' }, { status: 500 })
  }
}
