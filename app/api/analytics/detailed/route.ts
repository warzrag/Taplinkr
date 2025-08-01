import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Récupérer les paramètres de période
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '7days'
    const linkId = searchParams.get('linkId')

    // Calculer les dates selon la période
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '24hours':
        startDate.setHours(now.getHours() - 24)
        break
      case '7days':
        startDate.setDate(now.getDate() - 7)
        break
      case '30days':
        startDate.setDate(now.getDate() - 30)
        break
      case '90days':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 7)
    }

    // Conditions de filtre
    const whereClause: any = {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: now
      }
    }

    if (linkId) {
      whereClause.linkId = linkId
    }

    // Récupérer les événements analytics
    const events = await prisma.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    // Analyser les données
    const analytics = {
      overview: {
        totalClicks: events.filter(e => e.eventType === 'click').length,
        totalViews: events.filter(e => e.eventType === 'view').length,
        uniqueVisitors: new Set(events.map(e => e.ip)).size,
        conversionRate: 0
      },
      geography: {
        countries: {} as Record<string, number>,
        cities: {} as Record<string, number>,
        topCountries: [] as Array<{ country: string, clicks: number, percentage: number }>
      },
      traffic: {
        sources: {} as Record<string, number>,
        mediums: {} as Record<string, number>,
        topSources: [] as Array<{ source: string, clicks: number, percentage: number }>
      },
      devices: {
        types: {} as Record<string, number>,
        browsers: {} as Record<string, number>,
        os: {} as Record<string, number>
      },
      timeline: [] as Array<{ date: string, clicks: number, views: number }>
    }

    // Calculer le taux de conversion
    if (analytics.overview.totalViews > 0) {
      analytics.overview.conversionRate = Math.round((analytics.overview.totalClicks / analytics.overview.totalViews) * 100)
    }

    // Analyser la géographie
    events.forEach(event => {
      if (event.country && event.country !== 'Unknown') {
        analytics.geography.countries[event.country] = (analytics.geography.countries[event.country] || 0) + 1
      }
      if (event.city && event.city !== 'Unknown') {
        analytics.geography.cities[event.city] = (analytics.geography.cities[event.city] || 0) + 1
      }
    })

    // Top 10 pays
    analytics.geography.topCountries = Object.entries(analytics.geography.countries)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([country, clicks]) => ({
        country,
        clicks,
        percentage: Math.round((clicks / events.length) * 100)
      }))

    // Analyser les sources de trafic
    events.forEach(event => {
      const source = event.utmSource || 'Direct'
      const medium = event.utmMedium || 'none'
      
      analytics.traffic.sources[source] = (analytics.traffic.sources[source] || 0) + 1
      analytics.traffic.mediums[medium] = (analytics.traffic.mediums[medium] || 0) + 1
    })

    // Top 10 sources
    analytics.traffic.topSources = Object.entries(analytics.traffic.sources)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([source, clicks]) => ({
        source,
        clicks,
        percentage: Math.round((clicks / events.length) * 100)
      }))

    // Analyser les appareils
    events.forEach(event => {
      if (event.device) {
        analytics.devices.types[event.device] = (analytics.devices.types[event.device] || 0) + 1
      }
      if (event.browser) {
        analytics.devices.browsers[event.browser] = (analytics.devices.browsers[event.browser] || 0) + 1
      }
      if (event.os) {
        analytics.devices.os[event.os] = (analytics.devices.os[event.os] || 0) + 1
      }
    })

    // Créer la timeline
    const timelineMap = new Map<string, { clicks: number, views: number }>()
    
    events.forEach(event => {
      const date = new Date(event.createdAt).toISOString().split('T')[0]
      if (!timelineMap.has(date)) {
        timelineMap.set(date, { clicks: 0, views: 0 })
      }
      const stats = timelineMap.get(date)!
      if (event.eventType === 'click') {
        stats.clicks++
      } else if (event.eventType === 'view') {
        stats.views++
      }
    })

    // Remplir les dates manquantes
    const currentDate = new Date(startDate)
    while (currentDate <= now) {
      const dateStr = currentDate.toISOString().split('T')[0]
      if (!timelineMap.has(dateStr)) {
        timelineMap.set(dateStr, { clicks: 0, views: 0 })
      }
      currentDate.setDate(currentDate.getDate() + 1)
    }

    analytics.timeline = Array.from(timelineMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, stats]) => ({ date, ...stats }))

    // Récupérer aussi les clics récents avec détails
    const recentClicks = await prisma.analyticsEvent.findMany({
      where: {
        ...whereClause,
        eventType: 'click'
      },
      include: {
        link: {
          select: {
            title: true,
            slug: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    const recentClicksData = recentClicks.map(click => ({
      id: click.id,
      linkTitle: click.link.title,
      linkSlug: click.link.slug,
      country: click.country || 'Unknown',
      city: click.city || 'Unknown',
      device: click.device || 'Unknown',
      browser: click.browser || 'Unknown',
      source: click.utmSource || 'Direct',
      referer: click.referer || 'Direct',
      createdAt: click.createdAt
    }))

    return NextResponse.json({
      analytics,
      recentClicks: recentClicksData,
      period
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics détaillées:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}