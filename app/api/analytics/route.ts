import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { startOfDay, endOfDay, subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const linkId = searchParams.get('linkId')
    const days = parseInt(searchParams.get('days') || '7')

    const startDate = startOfDay(subDays(new Date(), days - 1))
    const endDate = endOfDay(new Date())

    // Construire la clause WHERE en fonction de l'utilisateur et du linkId
    let whereClause: any = {
      timestamp: { gte: startDate, lte: endDate }
    }

    // Si un linkId spécifique est demandé
    if (linkId) {
      // Vérifier que le lien appartient à l'utilisateur ou que c'est un admin
      const link = await prisma.link.findUnique({
        where: { id: linkId }
      })

      if (!link) {
        return NextResponse.json({ error: 'Lien introuvable' }, { status: 404 })
      }

      if (link.userId !== session.user.id && session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
      }

      whereClause.linkId = linkId
    } else {
      // Sinon, filtrer par utilisateur (sauf pour les admins)
      if (session.user.role !== 'ADMIN') {
        whereClause.link = {
          userId: session.user.id
        }
      }
    }

    // Récupérer les clics
    const clicks = await prisma.click.findMany({
      where: whereClause,
      include: {
        link: {
          include: {
            user: {
              select: { name: true, email: true }
            }
          }
        }
      },
      orderBy: { timestamp: 'desc' }
    })

    // Statistiques globales
    const totalClicks = clicks.length
    const uniqueLinks = new Set(clicks.map(c => c.linkId)).size

    // Clics par jour
    const clicksByDay: Record<string, number> = {}
    for (let i = 0; i < days; i++) {
      const date = subDays(new Date(), i)
      const dateKey = date.toISOString().split('T')[0]
      clicksByDay[dateKey] = 0
    }

    clicks.forEach(click => {
      const dateKey = click.timestamp.toISOString().split('T')[0]
      if (clicksByDay[dateKey] !== undefined) {
        clicksByDay[dateKey]++
      }
    })

    // Top des liens (si pas de linkId spécifique)
    let topLinks: any[] = []
    if (!linkId) {
      const linkClickCounts: Record<string, { link: any, count: number }> = {}
      
      clicks.forEach(click => {
        if (!linkClickCounts[click.linkId]) {
          linkClickCounts[click.linkId] = { link: click.link, count: 0 }
        }
        linkClickCounts[click.linkId].count++
      })

      topLinks = Object.values(linkClickCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => ({
          ...item.link,
          clicks: item.count
        }))
    }

    // Statistiques par navigateur et OS (via user agent)
    const browsers: Record<string, number> = {}
    const devices: Record<string, number> = {}

    clicks.forEach(click => {
      const ua = click.userAgent || 'Unknown'
      
      // Détection basique du navigateur
      let browser = 'Autre'
      if (ua.includes('Chrome')) browser = 'Chrome'
      else if (ua.includes('Firefox')) browser = 'Firefox'
      else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
      else if (ua.includes('Edge')) browser = 'Edge'
      
      browsers[browser] = (browsers[browser] || 0) + 1

      // Détection basique du device
      let device = 'Desktop'
      if (ua.includes('Mobile')) device = 'Mobile'
      else if (ua.includes('Tablet')) device = 'Tablet'
      
      devices[device] = (devices[device] || 0) + 1
    })

    // Referrers
    const referrers: Record<string, number> = {}
    clicks.forEach(click => {
      const ref = click.referer || 'Direct'
      referrers[ref] = (referrers[ref] || 0) + 1
    })

    const topReferrers = Object.entries(referrers)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([url, count]) => ({ url, count }))

    return NextResponse.json({
      totalClicks,
      uniqueLinks,
      clicksByDay,
      topLinks,
      browsers,
      devices,
      topReferrers,
      recentClicks: clicks.slice(0, 10).map(click => ({
        id: click.id,
        timestamp: click.timestamp,
        linkTitle: click.link.title,
        linkUrl: click.link.url,
        userAgent: click.userAgent,
        referer: click.referer,
        // Inclure info utilisateur pour les admins
        ...(session.user.role === 'ADMIN' && {
          linkOwner: click.link.user?.name || click.link.user?.email
        })
      }))
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des analytics' }, { status: 500 })
  }
}