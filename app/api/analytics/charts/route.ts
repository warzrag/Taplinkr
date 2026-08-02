import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

type CountMap = Record<string, number>

interface LinkStats {
  id: string
  name: string
  slug: string
  isDirect: boolean
  clicks: number
  todayClicks: number
  views: number
  visitors: Set<string>
  sources: CountMap
}

function increment(map: CountMap, key?: string | null) {
  const cleanKey = key?.trim()
  if (!cleanKey || cleanKey.toLowerCase() === 'unknown') return
  map[cleanKey] = (map[cleanKey] || 0) + 1
}

function topEntries(map: CountMap, limit = 8): Array<[string, number]> {
  return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, limit)
}

function sourceFromReferer(referer?: string | null) {
  if (!referer || referer === 'direct') return 'Direct'
  try {
    const hostname = new URL(referer).hostname.replace(/^www\./, '').toLowerCase()
    if (hostname.includes('instagram')) return 'Instagram'
    if (hostname === 't.co' || hostname.includes('twitter') || hostname === 'x.com') return 'X / Twitter'
    if (hostname.includes('reddit')) return 'Reddit'
    if (hostname.includes('tiktok')) return 'TikTok'
    if (hostname.includes('google')) return 'Google'
    if (hostname.includes('youtube') || hostname === 'youtu.be') return 'YouTube'
    if (hostname.includes('facebook') || hostname === 'fb.com') return 'Facebook'
    return hostname
  } catch {
    return referer.slice(0, 48)
  }
}

function growth(current: number, previous: number) {
  if (previous === 0) return current > 0 ? 100 : 0
  return Math.round(((current - previous) / previous) * 100)
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const user = await prisma.user.findUnique({ where: { email: session.user.email }, select: { id: true } })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    const days = Math.min(Math.max(Number.parseInt(searchParams.get('days') || '7', 10) || 7, 1), 90)
    const endDate = new Date()
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - days)
    const previousStartDate = new Date(startDate)
    previousStartDate.setDate(previousStartDate.getDate() - days)

    const links = await prisma.link.findMany({
      where: { userId: user.id, ...(linkId ? { id: linkId } : {}) },
      select: { id: true, title: true, internalName: true, slug: true, isDirect: true },
      orderBy: { order: 'asc' },
    })
    const linkIds = links.map(link => link.id)
    const directLinkIds = links.filter(link => link.isDirect).map(link => link.id)

    const [events, directClicks, allFilteredClicks, previousEvents, previousDirectClicks] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { userId: user.id, ...(linkId ? { linkId } : {}), createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
      }),
      directLinkIds.length ? prisma.click.findMany({
        where: { userId: user.id, linkId: { in: directLinkIds }, createdAt: { gte: startDate, lte: endDate } },
        orderBy: { createdAt: 'asc' },
      }) : [],
      prisma.filteredClick.findMany({
        // Firestore would require a new three-field composite index for
        // userId + linkId + createdAt. Keep this query on the existing
        // userId index and narrow the small result set in memory instead.
        where: { userId: user.id },
        select: { linkId: true, reason: true, createdAt: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { userId: user.id, ...(linkId ? { linkId } : {}), createdAt: { gte: previousStartDate, lt: startDate } },
        select: { eventType: true },
      }),
      directLinkIds.length ? prisma.click.count({
        where: { userId: user.id, linkId: { in: directLinkIds }, createdAt: { gte: previousStartDate, lt: startDate } },
      }) : 0,
    ])
    const selectedLinkIds = new Set(linkIds)
    const filteredClicks = allFilteredClicks.filter(click =>
      selectedLinkIds.has(click.linkId) && click.createdAt >= startDate && click.createdAt <= endDate
    )

    const dateMap = new Map<string, { clicks: number; views: number; visitors: Set<string> }>()
    const cursor = new Date(startDate)
    while (cursor <= endDate) {
      dateMap.set(cursor.toISOString().split('T')[0], { clicks: 0, views: 0, visitors: new Set() })
      cursor.setDate(cursor.getDate() + 1)
    }

    const countries: CountMap = {}
    const cities: CountMap = {}
    const devices: CountMap = {}
    const browsers: CountMap = {}
    const operatingSystems: CountMap = {}
    const sources: CountMap = {}
    const hourlyDistribution: CountMap = {}
    const weekdayDistribution: CountMap = {}
    const uniqueVisitors = new Set<string>()
    const today = endDate.toISOString().split('T')[0]
    const linkMap = new Map<string, LinkStats>(links.map(link => [link.id, {
      id: link.id,
      name: link.internalName || link.title || link.slug,
      slug: link.slug,
      isDirect: link.isDirect,
      clicks: 0,
      todayClicks: 0,
      views: 0,
      visitors: new Set<string>(),
      sources: {} as CountMap,
    }] as const))

    const registerClick = (event: {
      linkId: string
      createdAt: Date
      ip?: string | null
      country?: string | null
      city?: string | null
      device?: string | null
      browser?: string | null
      os?: string | null
      source: string
    }) => {
      const date = event.createdAt.toISOString().split('T')[0]
      const day = dateMap.get(date)
      if (day) {
        day.clicks += 1
        if (event.ip) day.visitors.add(event.ip)
      }
      const link = linkMap.get(event.linkId)
      if (link) {
        link.clicks += 1
        if (date === today) link.todayClicks += 1
        if (event.ip) link.visitors.add(event.ip)
        increment(link.sources, event.source)
      }
      if (event.ip) uniqueVisitors.add(event.ip)
      increment(countries, event.country)
      increment(cities, event.city)
      increment(devices, event.device)
      increment(browsers, event.browser)
      increment(operatingSystems, event.os)
      increment(sources, event.source)
      increment(hourlyDistribution, String(event.createdAt.getHours()))
      increment(weekdayDistribution, event.createdAt.toLocaleDateString('en-US', { weekday: 'short' }))
    }

    for (const event of events) {
      const date = event.createdAt.toISOString().split('T')[0]
      if (event.eventType === 'view') {
        const day = dateMap.get(date)
        if (day) {
          day.views += 1
          if (event.ip) day.visitors.add(event.ip)
        }
        const link = linkMap.get(event.linkId)
        if (link) link.views += 1
        if (event.ip) uniqueVisitors.add(event.ip)
        continue
      }
      if (event.eventType === 'click') {
        registerClick({
          ...event,
          source: event.utmSource?.trim() || sourceFromReferer(event.referer),
        })
      }
    }

    for (const click of directClicks) {
      registerClick({ ...click, source: sourceFromReferer(click.referer) })
    }

    const summary = Array.from(dateMap, ([date, value]) => ({
      date,
      clicks: value.clicks,
      views: value.views,
      visitors: value.visitors.size,
      ctr: value.views > 0 ? Math.round((value.clicks / value.views) * 1000) / 10 : 0,
    }))
    const totalClicks = events.filter(event => event.eventType === 'click').length + directClicks.length
    const totalViews = events.filter(event => event.eventType === 'view').length
    const previousClicks = previousEvents.filter(event => event.eventType === 'click').length + previousDirectClicks
    const previousViews = previousEvents.filter(event => event.eventType === 'view').length
    const botsFiltered = filteredClicks.filter(click => ['bot', 'preview', 'prefetch'].includes(click.reason)).length
    const duplicatesFiltered = filteredClicks.filter(click => ['duplicate', 'burst'].includes(click.reason)).length

    const linkPerformance = Array.from(linkMap.values())
      .map(link => ({
        id: link.id,
        name: link.name,
        slug: link.slug,
        type: link.isDirect ? 'Direct' : 'Landing page',
        clicks: link.clicks,
        todayClicks: link.todayClicks,
        views: link.views,
        uniqueVisitors: link.visitors.size,
        ctr: link.views > 0 ? Math.round((link.clicks / link.views) * 1000) / 10 : null,
        topSource: topEntries(link.sources, 1)[0]?.[0] || 'Direct',
      }))
      .sort((a, b) => b.clicks - a.clicks)

    return NextResponse.json({
      summary,
      linkPerformance,
      stats: {
        topCountries: topEntries(countries),
        topCities: topEntries(cities),
        topDevices: topEntries(devices),
        topBrowsers: topEntries(browsers),
        topOperatingSystems: topEntries(operatingSystems),
        topSources: topEntries(sources),
        hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: hourlyDistribution[String(hour)] || 0 })),
        weekdayDistribution: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({ day, clicks: weekdayDistribution[day] || 0 })),
      },
      totals: {
        clicks: totalClicks,
        views: totalViews,
        uniqueVisitors: uniqueVisitors.size,
        ctr: totalViews > 0 ? Math.round((totalClicks / totalViews) * 1000) / 10 : 0,
        clicksGrowth: growth(totalClicks, previousClicks),
        viewsGrowth: growth(totalViews, previousViews),
        filteredClicks: filteredClicks.length,
        botsFiltered,
        duplicatesFiltered,
      },
    })
  } catch (error) {
    console.error('Analytics charts error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
