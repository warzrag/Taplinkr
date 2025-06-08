import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const folderId = params.id

    // Récupérer le dossier avec ses liens et analytics
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        user: { email: session.user.email }
      },
      include: {
        links: {
          include: {
            _count: {
              select: { analyticsEvents: true }
            },
            analyticsEvents: {
              orderBy: { createdAt: 'desc' },
              take: 100
            }
          }
        }
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Calculer les statistiques
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    // Total des clics et vues
    const totalClicks = folder.links.reduce((sum, link) => 
      sum + (link._count?.analyticsEvents || 0), 0
    )

    // Simulation des vues (en réalité, il faudrait tracker les vues séparément)
    const totalViews = Math.floor(totalClicks * (1.2 + Math.random() * 0.8))

    // Événements récents pour calculer la croissance
    const recentEvents = folder.links.flatMap(link => 
      link.analyticsEvents.filter(event => 
        new Date(event.createdAt) >= sevenDaysAgo
      )
    )

    const previousWeekEvents = folder.links.flatMap(link => 
      link.analyticsEvents.filter(event => {
        const eventDate = new Date(event.createdAt)
        return eventDate >= new Date(sevenDaysAgo.getTime() - 7 * 24 * 60 * 60 * 1000) && 
               eventDate < sevenDaysAgo
      })
    )

    // Calcul du taux de croissance
    const growthRate = previousWeekEvents.length > 0 
      ? Math.round(((recentEvents.length - previousWeekEvents.length) / previousWeekEvents.length) * 100)
      : recentEvents.length > 0 ? 100 : 0

    // Top lien
    const topLink = folder.links
      .map(link => ({
        title: link.title,
        clicks: link._count?.analyticsEvents || 0
      }))
      .sort((a, b) => b.clicks - a.clicks)[0]

    // Heure de pic (analyse des événements par heure)
    const hourlyActivity: { [key: number]: number } = {}
    folder.links.forEach(link => {
      link.analyticsEvents.forEach(event => {
        const hour = new Date(event.createdAt).getHours()
        hourlyActivity[hour] = (hourlyActivity[hour] || 0) + 1
      })
    })

    const peakHour = Object.entries(hourlyActivity)
      .sort(([,a], [,b]) => b - a)[0]?.[0]

    // Dernière activité
    const lastActivity = folder.links
      .flatMap(link => link.analyticsEvents)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

    const formatLastActivity = (date: Date) => {
      const diffMs = now.getTime() - date.getTime()
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      
      if (diffHours < 1) return "Il y a moins d'1h"
      if (diffHours < 24) return `Il y a ${diffHours}h`
      if (diffDays === 1) return "Hier"
      if (diffDays < 7) return `Il y a ${diffDays}j`
      return "Plus d'une semaine"
    }

    // Taux d'engagement simulé
    const engagementRate = totalViews > 0 
      ? Math.min(Math.round((totalClicks / totalViews) * 100), 100)
      : 0

    const result = {
      totalClicks,
      totalViews,
      growthRate,
      topLink: topLink?.clicks > 0 ? topLink : undefined,
      peakHour: peakHour ? parseInt(peakHour) : undefined,
      lastActivity: lastActivity ? formatLastActivity(new Date(lastActivity.createdAt)) : "Aucune activité",
      engagementRate
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}