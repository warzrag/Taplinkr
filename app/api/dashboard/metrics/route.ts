import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import {
  calculateDailyLinkClicks,
  calculateDashboardMetrics,
  calculateHourlyClicks,
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
      const emptyMetrics = calculateDashboardMetrics({
        clicks: [],
        filteredClicks: [],
        directLinkIds: new Set(),
      })
      return NextResponse.json({
        period,
        ...emptyMetrics,
        changes: { realClicks: 0, uniqueVisitors: 0, clickThroughRate: 0, botsFiltered: 0 },
        links: [],
        dailyClicks: [],
        hourlyClicks: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0 })),
        topLinks: [],
        recentActivity: [],
      })
    }

    // Read only clicks belonging to visible links. A global date query makes every
    // dashboard visit consume reads for the entire platform.
    const [clickGroups, filteredClickGroups] = await Promise.all([
      Promise.all([...linkIds].map(linkId => prisma.click.findMany({
        where: { linkId },
        select: {
          id: true,
          linkId: true,
          createdAt: true,
          ip: true,
          sessionId: true,
          multiLinkId: true,
          country: true,
          device: true,
        },
      }))),
      Promise.all([...linkIds].map(linkId => prisma.filteredClick.findMany({
        where: { linkId },
        select: {
          linkId: true,
          reason: true,
          createdAt: true,
        },
      }))),
    ])
    const allClicks = clickGroups.flat()
    const allFilteredClicks = filteredClickGroups.flat()
    const recentClicks = allClicks
      .filter(click => click.createdAt >= start && click.createdAt <= now)
    const recentFilteredClicks = allFilteredClicks
      .filter(click => click.createdAt >= start && click.createdAt <= now)

    const periodDays = period === 'today' ? 1 : period === '7d' ? 7 : 30
    const previousStart = new Date(start)
    previousStart.setUTCDate(previousStart.getUTCDate() - periodDays)
    const previousClicks = allClicks.filter(click => click.createdAt >= previousStart && click.createdAt < start)
    const previousFilteredClicks = allFilteredClicks.filter(click => click.createdAt >= previousStart && click.createdAt < start)
    const directLinkIds = new Set<string>(
      links
        .filter((link: any) => link.isDirect)
        .map((link: any) => String(link.id)),
    )

    const metrics = calculateDashboardMetrics({
      clicks: recentClicks,
      filteredClicks: recentFilteredClicks,
      directLinkIds,
    })
    const previousMetrics = calculateDashboardMetrics({
      clicks: previousClicks,
      filteredClicks: previousFilteredClicks,
      directLinkIds,
    })
    const dailyBreakdown = calculateDailyLinkClicks({
      period,
      now,
      timeZone,
      clicks: recentClicks,
      links: links.map(link => ({
        id: link.id,
        name: link.internalName?.trim() || link.title,
        slug: link.slug,
        isDirect: link.isDirect,
      })),
    })
    const hourlyClicks = calculateHourlyClicks({ now, timeZone, clicks: recentClicks, directLinkIds })
    const completedClickCountByLink = (items: typeof recentClicks) => {
      const counts = new Map<string, number>()
      for (const click of items) {
        if (!click.multiLinkId && !directLinkIds.has(click.linkId)) continue
        counts.set(click.linkId, (counts.get(click.linkId) || 0) + 1)
      }
      return counts
    }
    const currentByLink = completedClickCountByLink(recentClicks)
    const previousByLink = completedClickCountByLink(previousClicks)
    const topLinks = links
      .map(link => ({
        id: link.id,
        name: link.internalName?.trim() || link.title,
        slug: link.slug,
        clicks: currentByLink.get(link.id) || 0,
        previousClicks: previousByLink.get(link.id) || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
    const linkNames = new Map(links.map(link => [link.id, link.internalName?.trim() || link.title]))
    const recentActivity = recentClicks
      .filter(click => Boolean(click.multiLinkId) || directLinkIds.has(click.linkId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map(click => ({
        id: click.id,
        linkId: click.linkId,
        linkName: linkNames.get(click.linkId) || 'Link',
        createdAt: click.createdAt.toISOString(),
        country: click.country || null,
        device: click.device || null,
      }))
    const percentageChange = (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    return NextResponse.json({
      period,
      start: start.toISOString(),
      end: now.toISOString(),
      ...metrics,
      ...dailyBreakdown,
      hourlyClicks,
      topLinks,
      recentActivity,
      changes: {
        realClicks: percentageChange(metrics.realClicks, previousMetrics.realClicks),
        uniqueVisitors: percentageChange(metrics.uniqueVisitors, previousMetrics.uniqueVisitors),
        clickThroughRate: percentageChange(metrics.clickThroughRate, previousMetrics.clickThroughRate),
        botsFiltered: percentageChange(metrics.botsFiltered, previousMetrics.botsFiltered),
      },
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
