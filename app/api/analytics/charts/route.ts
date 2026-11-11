import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import {
  dateKeyInTimeZone,
  dateKeysBetween,
  hourAndWeekdayInTimeZone,
  nextDateKey,
  shiftDateKey,
  zonedDayStart,
} from '@/lib/dashboard-metrics'
import { prisma } from '@/lib/prisma'
import { resolveReportingTimeZone } from '@/lib/reporting-timezone'

const MAX_DAYS = 90
const presetDays: Record<string, number> = { today: 1, '7d': 7, '30d': 30, '90d': 90 }
const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/

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
  countries: CountMap
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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, userProfile: { select: { analytics: true } } },
    })
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    // Journees decoupees a minuit dans le fuseau de la personne (son choix,
    // sinon celui de son appareil), et non plus a minuit UTC.
    const { timeZone, chosen: chosenTimeZone } = resolveReportingTimeZone(user.userProfile?.analytics, searchParams.get('timeZone'))
    const now = new Date()
    const todayKey = dateKeyInTimeZone(now, timeZone)
    const period = searchParams.get('period') || '7d'
    let firstKey: string
    let lastKey: string
    if (period === 'yesterday') {
      firstKey = lastKey = shiftDateKey(todayKey, 1)
    } else if (period === 'custom') {
      const from = searchParams.get('from') || ''
      const to = searchParams.get('to') || ''
      if (!dateKeyPattern.test(from) || !dateKeyPattern.test(to) || from > to) {
        return NextResponse.json({ error: 'Choose a valid start and end date.' }, { status: 400 })
      }
      firstKey = from
      lastKey = to > todayKey ? todayKey : to
      if (firstKey > lastKey) return NextResponse.json({ error: 'The period starts in the future.' }, { status: 400 })
      if (dateKeysBetween(firstKey, lastKey).length > MAX_DAYS) {
        return NextResponse.json({ error: `Choose a period of ${MAX_DAYS} days or less.` }, { status: 400 })
      }
    } else {
      const days = presetDays[period] || 7
      lastKey = todayKey
      firstKey = shiftDateKey(todayKey, days - 1)
    }
    const dayKeys = dateKeysBetween(firstKey, lastKey)
    const startDate = zonedDayStart(firstKey, timeZone)
    const dayAfterEnd = zonedDayStart(nextDateKey(lastKey), timeZone)
    const endDate = dayAfterEnd < now ? dayAfterEnd : now
    // Periode precedente de meme longueur. Pour une periode en cours, on la
    // coupe a la meme heure : aujourd'hui jusqu'a 15 h contre hier jusqu'a 15 h.
    const previousStartDate = zonedDayStart(shiftDateKey(firstKey, dayKeys.length), timeZone)
    const previousEndDate = new Date(previousStartDate.getTime() + (endDate.getTime() - startDate.getTime()))

    const links = await prisma.link.findMany({
      where: { userId: user.id, ...(linkId ? { id: linkId } : {}) },
      select: { id: true, title: true, internalName: true, slug: true, isDirect: true },
      orderBy: { order: 'asc' },
    })
    const linkIds = links.map(link => link.id)
    const directLinkIds = links.filter(link => link.isDirect).map(link => link.id)

    const [events, directClicks, allFilteredClicks, previousEvents, previousDirectClicks] = await Promise.all([
      prisma.analyticsEvent.findMany({
        where: { userId: user.id, ...(linkId ? { linkId } : {}), createdAt: { gte: startDate, lt: endDate } },
        orderBy: { createdAt: 'asc' },
      }),
      directLinkIds.length ? prisma.click.findMany({
        where: { userId: user.id, linkId: { in: directLinkIds }, createdAt: { gte: startDate, lt: endDate } },
        orderBy: { createdAt: 'asc' },
      }) : [],
      prisma.filteredClick.findMany({
        where: { userId: user.id, createdAt: { gte: startDate, lt: endDate } },
        select: { linkId: true, reason: true, createdAt: true },
      }),
      prisma.analyticsEvent.findMany({
        where: { userId: user.id, ...(linkId ? { linkId } : {}), createdAt: { gte: previousStartDate, lt: previousEndDate } },
        select: { eventType: true },
      }),
      directLinkIds.length ? prisma.click.count({
        where: { userId: user.id, linkId: { in: directLinkIds }, createdAt: { gte: previousStartDate, lt: previousEndDate } },
      }) : 0,
    ])
    const selectedLinkIds = new Set(linkIds)
    const filteredClicks = allFilteredClicks.filter(click =>
      selectedLinkIds.has(click.linkId)
    )

    const dateMap = new Map<string, { clicks: number; views: number; visitors: Set<string> }>()
    for (const key of dayKeys) dateMap.set(key, { clicks: 0, views: 0, visitors: new Set() })

    const countries: CountMap = {}
    const countryVisitors = new Map<string, Set<string>>()
    let unlocatedClicks = 0
    const cities: CountMap = {}
    const devices: CountMap = {}
    const browsers: CountMap = {}
    const operatingSystems: CountMap = {}
    const sources: CountMap = {}
    const hourlyDistribution: CountMap = {}
    const weekdayDistribution: CountMap = {}
    const uniqueVisitors = new Set<string>()
    const today = todayKey
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
      countries: {} as CountMap,
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
      const date = dateKeyInTimeZone(event.createdAt, timeZone)
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
        increment(link.countries, event.country)
      }
      if (event.ip) uniqueVisitors.add(event.ip)
      increment(countries, event.country)
      const country = event.country?.trim()
      if (!country || country.toLowerCase() === 'unknown') {
        unlocatedClicks += 1
      } else if (event.ip) {
        const visitors = countryVisitors.get(country) || new Set<string>()
        visitors.add(event.ip)
        countryVisitors.set(country, visitors)
      }
      increment(cities, event.city)
      increment(devices, event.device)
      increment(browsers, event.browser)
      increment(operatingSystems, event.os)
      increment(sources, event.source)
      const { hour, weekday } = hourAndWeekdayInTimeZone(event.createdAt, timeZone)
      increment(hourlyDistribution, String(hour))
      increment(weekdayDistribution, weekday)
    }

    for (const event of events) {
      const date = dateKeyInTimeZone(event.createdAt, timeZone)
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
      period: { name: period, from: firstKey, to: lastKey, timeZone, chosenTimeZone },
      summary,
      linkPerformance,
      stats: {
        topCountries: topEntries(countries),
        countries: Object.entries(countries)
          .sort(([, a], [, b]) => b - a)
          .map(([country, clicks]) => ({ country, clicks, visitors: countryVisitors.get(country)?.size || 0 })),
        countriesByLink: Object.fromEntries(Array.from(linkMap.values()).map(link => [link.id, topEntries(link.countries, Infinity)])),
        unlocatedClicks,
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
