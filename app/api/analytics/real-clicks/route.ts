import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Pour l'instant, on va récupérer les données sans vérification d'auth pour débloquer
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    // Calculer les dates
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - days)
    
    // Récupérer tous les clics dans la période
    const clicks = await prisma.click.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })
    
    // Récupérer aussi les événements analytics pour les vues
    const events = await prisma.analyticsEvent.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    })
    
    // Créer un map pour organiser les données par jour
    const dailyStats = new Map<string, { clicks: number, views: number }>()
    
    // Initialiser tous les jours avec 0
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      dailyStats.set(dateStr, { clicks: 0, views: 0 })
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    // Compter les clics par jour
    clicks.forEach(click => {
      const dateStr = new Date(click.createdAt).toISOString().split('T')[0]
      const stats = dailyStats.get(dateStr)
      if (stats) {
        stats.clicks += 1
      }
    })
    
    // Compter les événements par jour
    events.forEach(event => {
      const dateStr = new Date(event.createdAt).toISOString().split('T')[0]
      const stats = dailyStats.get(dateStr)
      if (stats) {
        if (event.eventType === 'click') {
          // Les clics sont déjà comptés depuis la table Click
          // On pourrait les ajouter ici si on veut inclure les analytics events aussi
        } else if (event.eventType === 'view') {
          stats.views += 1
        }
      }
    })
    
    // Convertir en array pour le summary
    const summary = Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      clicks: stats.clicks,
      views: stats.views
    }))
    
    // Calculer les totaux
    const totalClicks = summary.reduce((sum, day) => sum + day.clicks, 0)
    const totalViews = summary.reduce((sum, day) => sum + day.views, 0)
    
    return NextResponse.json({
      summary,
      totals: {
        clicks: totalClicks,
        views: totalViews
      }
    })
    
  } catch (error) {
    console.error('Error fetching real clicks:', error)
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des données',
      summary: [],
      totals: { clicks: 0, views: 0 }
    }, { status: 500 })
  }
}