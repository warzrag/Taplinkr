import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('No session found in analytics/charts')
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('User not found:', session.user.email)
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    const days = parseInt(searchParams.get('days') || '30')

    // Calculer les dates
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Conditions de filtre
    const whereClause: any = {
      userId: user.id,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (linkId) {
      whereClause.linkId = linkId
    }

    // Récupérer tous les événements
    const events = await prisma.analyticsEvent.findMany({
      where: whereClause,
      orderBy: { createdAt: 'asc' }
    })

    // Préparer les données pour les graphiques
    const summary: any[] = []
    const hourlyDistribution: Record<number, number> = {}
    const countryCount: Record<string, number> = {}
    const deviceCount: Record<string, number> = {}
    const browserCount: Record<string, number> = {}
    const sourceCount: Record<string, number> = {}

    // Initialiser hourly distribution
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0
    }

    // Créer un map pour le summary par date
    const dateMap = new Map<string, { clicks: number, views: number }>()

    // Initialiser toutes les dates entre startDate et endDate
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dateMap.set(dateStr, { clicks: 0, views: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Analyser tous les événements
    events.forEach(event => {
      const dateStr = new Date(event.createdAt).toISOString().split('T')[0]
      const hour = new Date(event.createdAt).getHours()
      
      // Summary par jour
      const dayStats = dateMap.get(dateStr)
      if (dayStats) {
        if (event.eventType === 'click') {
          dayStats.clicks++
        } else if (event.eventType === 'view') {
          dayStats.views++
        }
      }

      // Distribution horaire (seulement pour les clics)
      if (event.eventType === 'click') {
        hourlyDistribution[hour]++
      }

      // Compter par pays
      if (event.country && event.country !== 'Unknown') {
        countryCount[event.country] = (countryCount[event.country] || 0) + 1
      }

      // Compter par appareil
      if (event.device) {
        deviceCount[event.device] = (deviceCount[event.device] || 0) + 1
      }

      // Compter par navigateur
      if (event.browser) {
        browserCount[event.browser] = (browserCount[event.browser] || 0) + 1
      }

      // Compter par source
      const source = event.utmSource || 'Direct'
      sourceCount[source] = (sourceCount[source] || 0) + 1
    })

    // Convertir le dateMap en array pour le summary
    dateMap.forEach((stats, date) => {
      summary.push({
        date,
        clicks: stats.clicks,
        views: stats.views
      })
    })

    // Trier et prendre le top 5 pour chaque catégorie
    const topCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topDevices = Object.entries(deviceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topBrowsers = Object.entries(browserCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topSources = Object.entries(sourceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    // Calculer les totaux
    const totalClicks = events.filter(e => e.eventType === 'click').length
    const totalViews = events.filter(e => e.eventType === 'view').length
    const uniqueVisitors = new Set(events.map(e => e.ip)).size

    // Calculer le taux de croissance
    const halfwayDate = new Date(startDate)
    halfwayDate.setDate(halfwayDate.getDate() + Math.floor(days / 2))
    
    const firstHalfClicks = events.filter(e => 
      e.eventType === 'click' && new Date(e.createdAt) < halfwayDate
    ).length
    
    const secondHalfClicks = events.filter(e => 
      e.eventType === 'click' && new Date(e.createdAt) >= halfwayDate
    ).length
    
    const growthRate = firstHalfClicks > 0 
      ? Math.round(((secondHalfClicks - firstHalfClicks) / firstHalfClicks) * 100)
      : 0

    return NextResponse.json({
      summary,
      stats: {
        hourlyDistribution,
        topCountries,
        topDevices,
        topBrowsers,
        topSources
      },
      totals: {
        clicks: totalClicks,
        views: totalViews,
        uniqueVisitors,
        growthRate
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des données de graphiques:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}