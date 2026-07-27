import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import {
  calculateDailyLinkClicks,
  calculateDashboardMetrics,
  dashboardPeriodStart,
  type DashboardPeriod,
} from '@/lib/dashboard-metrics'
import { prisma } from '@/lib/prisma'

const periods = new Set<DashboardPeriod>(['today', '7d', '30d'])

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedPeriod = request.nextUrl.searchParams.get('period') as DashboardPeriod | null
    const period = requestedPeriod && periods.has(requestedPeriod) ? requestedPeriod : '30d'
    const timeZone = request.nextUrl.searchParams.get('timeZone') || 'UTC'
    const now = new Date()
    const requestedStart = request.nextUrl.searchParams.get('start')
    const parsedStart = requestedStart ? new Date(requestedStart) : null
    const earliestAllowed = new Date(now)
    earliestAllowed.setUTCDate(earliestAllowed.getUTCDate() - 31)
    const start = parsedStart && !Number.isNaN(parsedStart.getTime())
      && parsedStart <= now && parsedStart >= earliestAllowed
      ? parsedStart
      : dashboardPeriodStart(period, now)

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    })
    const teamMembers = user?.teamId
      ? await prisma.user.findMany({
          where: { teamId: user.teamId },
          select: { id: true },
        })
      : []
    const visibleUserIds = [...new Set([session.user.id, ...teamMembers.map(member => member.id)])]
    const links = await prisma.link.findMany({
      where: user?.teamId
        ? {
            OR: [
              { userId: { in: visibleUserIds } },
              { teamId: user.teamId, teamShared: true },
            ],
          }
        : { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        internalName: true,
        isDirect: true,
      },
      orderBy: { order: 'asc' },
    })
    const linkIds = new Set(links.map(link => link.id))

    if (linkIds.size === 0) {
      return NextResponse.json({
        period,
        ...calculateDashboardMetrics({
          clicks: [],
          filteredClicks: [],
          directLinkIds: new Set(),
        }),
        links: [],
        dailyClicks: [],
      })
    }

    // Query only by date so Firestore can use its automatic single-field index,
    // then apply team/link visibility in memory.
    const [recentClicks, recentFilteredClicks] = await Promise.all([
      prisma.click.findMany({
        where: { createdAt: { gte: start, lte: now } },
        select: {
          id: true,
          linkId: true,
          createdAt: true,
          ip: true,
          sessionId: true,
          multiLinkId: true,
        },
      }),
      prisma.filteredClick.findMany({
        where: { createdAt: { gte: start, lte: now } },
        select: {
          linkId: true,
          reason: true,
        },
      }),
    ])

    const metrics = calculateDashboardMetrics({
      clicks: recentClicks.filter(click => linkIds.has(click.linkId)),
      filteredClicks: recentFilteredClicks.filter(click => linkIds.has(click.linkId)),
      directLinkIds: new Set(links.filter(link => link.isDirect).map(link => link.id)),
    })
    const dailyBreakdown = calculateDailyLinkClicks({
      period,
      now,
      timeZone,
      clicks: recentClicks.filter(click => linkIds.has(click.linkId)),
      links: links.map(link => ({
        id: link.id,
        name: link.internalName?.trim() || link.title,
        slug: link.slug,
        isDirect: link.isDirect,
      })),
    })

    return NextResponse.json({
      period,
      start: start.toISOString(),
      end: now.toISOString(),
      ...metrics,
      ...dailyBreakdown,
    }, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Unable to load dashboard metrics:', error)
    return NextResponse.json({ error: 'Unable to load dashboard metrics' }, { status: 500 })
  }
}
