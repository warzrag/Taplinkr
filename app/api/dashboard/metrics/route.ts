import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { memoryCache } from '@/lib/cache'
import {
  calculateDashboardMetrics,
  calculateHourlyClicks,
  dashboardDateKeys,
  dateKeyInTimeZone,
  type DashboardPeriod,
} from '@/lib/dashboard-metrics'
import { loadDashboardAggregates, type WindowTotals } from '@/lib/dashboard-metrics-sql'
import { prisma } from '@/lib/prisma'
import {
  isValidTimeZone,
  readReportingTimeZone,
  writeReportingTimeZone,
} from '@/lib/reporting-timezone'

const periods = new Set<DashboardPeriod>(['today', '7d', '30d'])

// Le calcul complet enchaine cinq allers-retours vers la base puis agrege les
// clics un par un. Le garder brievement evite de tout refaire quand on change
// de periode et qu'on revient, ou qu'on revient sur l'onglet.
// Attention : ce cache vit dans la memoire de l'instance. Sur une instance
// froide il est vide, il ne remplace donc pas l'instantane cote navigateur.
const METRICS_TTL_MS = 30_000
const RECENT_ACTIVITY_LIMIT = 6

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const requestedPeriod = request.nextUrl.searchParams.get('period') as DashboardPeriod | null
    const period = requestedPeriod && periods.has(requestedPeriod) ? requestedPeriod : '30d'
    const now = new Date()

    // La cle contient l'identifiant du compte : jamais de fuite entre comptes.
    const cacheKey = `dashboard:metrics:${session.user.id}:${period}`
    const wantsComparison = request.nextUrl.searchParams.get('compare') === '1'
    const cached = wantsComparison ? null : memoryCache.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'Cache-Control': 'private, no-store, max-age=0, must-revalidate' },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        teamId: true,
        team: { select: { ownerId: true } },
      },
    })
    const reportingUserId = user?.team?.ownerId || session.user.id
    const reportingProfile = await prisma.userProfile.findUnique({
      where: { userId: reportingUserId },
      select: { analytics: true },
    })
    const storedTimeZone = readReportingTimeZone(reportingProfile?.analytics)
    const geoTimeZone = request.headers.get('x-vercel-ip-timezone')
    const browserTimeZone = request.nextUrl.searchParams.get('timeZone')
    const inferredTimeZone = isValidTimeZone(geoTimeZone)
      ? geoTimeZone
      : isValidTimeZone(browserTimeZone)
        ? browserTimeZone
        : 'UTC'
    const timeZone = storedTimeZone || inferredTimeZone

    if (!storedTimeZone) {
      await prisma.userProfile.upsert({
        where: { userId: reportingUserId },
        create: {
          userId: reportingUserId,
          analytics: writeReportingTimeZone(null, timeZone),
        },
        update: {
          analytics: writeReportingTimeZone(reportingProfile?.analytics, timeZone),
        },
      })
    }
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
      const emptyMetrics = {
        realClicks: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        visitsWithClick: 0,
        clickThroughRate: 0,
        botsFiltered: 0,
      }
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

    const periodDays = period === 'today' ? 1 : period === '7d' ? 7 : 30
    const currentDateKeys = dashboardDateKeys(period, now, timeZone)
    const currentDates = new Set(currentDateKeys)
    const previousDateKeys = dashboardDateKeys(period, now, timeZone, periodDays)
    const previousDates = new Set(previousDateKeys)

    // Borne basse des lectures. Sans elle, chaque affichage du dashboard relisait
    // la totalite de l'historique de clics pour n'en garder que la periode
    // demandee : le cout augmentait indefiniment avec l'anciennete du compte.
    // previousDateKeys[0] est le jour le plus ancien reellement utilise ; on
    // recule de deux jours parce que les cles de date sont calculees dans le
    // fuseau du compte et non en UTC.
    const since = new Date(`${previousDateKeys[0]}T00:00:00.000Z`)
    since.setUTCDate(since.getUTCDate() - 2)

    const linkIdList = links.map((link: any) => String(link.id))
    const directLinkIds = new Set<string>(
      links
        .filter((link: any) => link.isDirect)
        .map((link: any) => String(link.id)),
    )

    // Postgres fait les comptages et ne renvoie que les totaux. Avant, chaque
    // clic de la periode etait transporte puis additionne en JavaScript.
    const aggregates = await loadDashboardAggregates({
      linkIds: linkIdList,
      directLinkIds: [...directLinkIds],
      timeZone,
      since,
      currentDateKeys,
      previousDateKeys,
      todayKey: dateKeyInTimeZone(now, timeZone),
      recentActivityLimit: RECENT_ACTIVITY_LIMIT,
    })

    const toMetrics = (totals: WindowTotals) => ({
      realClicks: totals.realClicks,
      uniqueVisitors: totals.uniqueVisitors,
      pageViews: totals.pageViews,
      visitsWithClick: totals.visitsWithClick,
      clickThroughRate: totals.pageViews > 0
        ? Math.min(100, Number(((totals.visitsWithClick / totals.pageViews) * 100).toFixed(1)))
        : 0,
      botsFiltered: totals.botsFiltered,
    })

    const metrics = toMetrics(aggregates.totals.current)
    const previousMetrics = toMetrics(aggregates.totals.previous)

    const namedLinks = links.map(link => ({
      id: link.id,
      name: link.internalName?.trim() || link.title,
      slug: link.slug,
    }))

    const dailyBreakdown = {
      links: namedLinks,
      dailyClicks: currentDateKeys.map(date => {
        const perLink = aggregates.completedByDay.get(date)
        const clicks = Object.fromEntries(links.map(link => [link.id, perLink?.get(link.id) || 0]))
        return {
          date,
          clicks,
          total: Object.values(clicks).reduce((sum, value) => sum + value, 0),
        }
      }),
    }

    const hourlyClicks = aggregates.hourlyCompleted.map((clicks, hour) => ({ hour, clicks }))

    const topLinks = namedLinks
      .map(link => ({
        ...link,
        clicks: aggregates.completedByLink.current.get(link.id) || 0,
        previousClicks: aggregates.completedByLink.previous.get(link.id) || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)

    const linkNames = new Map(namedLinks.map(link => [link.id, link.name]))
    const recentActivity = aggregates.recentActivity.map(click => ({
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

    const payload = {
      period,
      start: currentDateKeys[0],
      end: now.toISOString(),
      timeZone,
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
    }

    // ?compare=1 rejoue l'ancien calcul en JavaScript sur les memes donnees et
    // renvoie les ecarts. Sert a prouver que le passage en SQL n'a rien change
    // avant de lui faire confiance. Volontairement lent : il relit toutes les
    // lignes, comme avant.
    if (wantsComparison) {
      const [allClicks, allFilteredClicks] = await Promise.all([
        prisma.click.findMany({
          where: { linkId: { in: linkIdList }, createdAt: { gte: since } },
          select: {
            id: true, linkId: true, createdAt: true, ip: true,
            sessionId: true, multiLinkId: true, country: true, device: true,
          },
        }),
        prisma.filteredClick.findMany({
          where: { linkId: { in: linkIdList }, createdAt: { gte: since } },
          select: { linkId: true, reason: true, createdAt: true },
        }),
      ])
      const inDates = (createdAt: Date, dates: Set<string>) => dates.has(dateKeyInTimeZone(createdAt, timeZone))
      const legacyCurrent = calculateDashboardMetrics({
        clicks: allClicks.filter(click => inDates(click.createdAt, currentDates)),
        filteredClicks: allFilteredClicks.filter(click => inDates(click.createdAt, currentDates)),
        directLinkIds,
      })
      const legacyPrevious = calculateDashboardMetrics({
        clicks: allClicks.filter(click => inDates(click.createdAt, previousDates)),
        filteredClicks: allFilteredClicks.filter(click => inDates(click.createdAt, previousDates)),
        directLinkIds,
      })
      const legacyHourly = calculateHourlyClicks({
        now, timeZone, directLinkIds,
        clicks: allClicks.filter(click => inDates(click.createdAt, currentDates)),
      })

      const differences: string[] = []
      const compare = (label: string, sql: number, legacy: number) => {
        if (sql !== legacy) differences.push(`${label}: SQL=${sql} JS=${legacy}`)
      }
      for (const key of ['realClicks', 'uniqueVisitors', 'pageViews', 'visitsWithClick', 'clickThroughRate', 'botsFiltered'] as const) {
        compare(`current.${key}`, (metrics as any)[key], (legacyCurrent as any)[key])
        compare(`previous.${key}`, (previousMetrics as any)[key], (legacyPrevious as any)[key])
      }
      legacyHourly.forEach((entry, hour) => compare(`hour.${hour}`, hourlyClicks[hour]?.clicks ?? 0, entry.clicks))

      return NextResponse.json({
        identical: differences.length === 0,
        rowsReadByLegacyPath: allClicks.length + allFilteredClicks.length,
        differences,
        sql: { current: metrics, previous: previousMetrics },
        legacy: { current: legacyCurrent, previous: legacyPrevious },
      }, { headers: { 'Cache-Control': 'private, no-store' } })
    }

    memoryCache.set(cacheKey, payload, METRICS_TTL_MS)

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    })
  } catch (error) {
    console.error('Unable to load dashboard metrics:', error)
    return NextResponse.json({ error: 'Unable to load dashboard metrics' }, { status: 500 })
  }
}
