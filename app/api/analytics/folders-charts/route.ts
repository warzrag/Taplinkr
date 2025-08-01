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

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculer les dates
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)

    // Récupérer tous les liens de l'utilisateur avec leurs dossiers
    const links = await prisma.link.findMany({
      where: { userId: user.id },
      include: { 
        folder: true,
        analyticsEvents: {
          where: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    })

    // Récupérer tous les événements analytics pour l'utilisateur
    const allEvents = await prisma.analyticsEvent.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        link: {
          include: {
            folder: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Grouper les événements par dossier
    const eventsByFolder = new Map<string, any[]>()
    const unorganizedEvents: any[] = []

    allEvents.forEach(event => {
      if (event.link.folderId) {
        const folderId = event.link.folderId
        if (!eventsByFolder.has(folderId)) {
          eventsByFolder.set(folderId, [])
        }
        eventsByFolder.get(folderId)!.push(event)
      } else {
        unorganizedEvents.push(event)
      }
    })

    // Créer les données analytics combinées pour tous les dossiers
    const summary: any[] = []
    const hourlyDistribution: Record<number, number> = {}
    const countryCount: Record<string, number> = {}
    const deviceCount: Record<string, number> = {}
    const browserCount: Record<string, number> = {}

    // Initialiser hourly distribution
    for (let i = 0; i < 24; i++) {
      hourlyDistribution[i] = 0
    }

    // Créer un map pour le summary par date
    const dateMap = new Map<string, { clicks: number, views: number }>()

    // Initialiser toutes les dates
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dateMap.set(dateStr, { clicks: 0, views: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Analyser tous les événements
    allEvents.forEach(event => {
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

      // Distribution horaire
      if (event.eventType === 'click') {
        hourlyDistribution[hour]++
      }

      // Comptes par pays, appareil, navigateur
      if (event.country && event.country !== 'Unknown') {
        countryCount[event.country] = (countryCount[event.country] || 0) + 1
      }
      if (event.device) {
        deviceCount[event.device] = (deviceCount[event.device] || 0) + 1
      }
      if (event.browser) {
        browserCount[event.browser] = (browserCount[event.browser] || 0) + 1
      }
    })

    // Convertir le dateMap en array
    dateMap.forEach((stats, date) => {
      summary.push({
        date,
        clicks: stats.clicks,
        views: stats.views
      })
    })

    // Trier et prendre le top pour chaque catégorie
    const topCountries = Object.entries(countryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topDevices = Object.entries(deviceCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    const topBrowsers = Object.entries(browserCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)

    return NextResponse.json({
      summary,
      stats: {
        hourlyDistribution,
        topCountries,
        topDevices,
        topBrowsers
      }
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des analytics des dossiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}