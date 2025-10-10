import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Mapping des noms de pays vers les codes ISO-2
const countryNameToCode: Record<string, string> = {
  'France': 'FR',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'Spain': 'ES',
  'Italy': 'IT',
  'Canada': 'CA',
  'Brazil': 'BR',
  'Japan': 'JP',
  'China': 'CN',
  'India': 'IN',
  'Australia': 'AU',
  'Mexico': 'MX',
  'Russia': 'RU',
  'South Africa': 'ZA',
  'Belgium': 'BE',
  'Netherlands': 'NL',
  'Switzerland': 'CH',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Portugal': 'PT',
  'Austria': 'AT',
  'Denmark': 'DK',
  'Finland': 'FI',
  'Greece': 'GR',
  'Poland': 'PL',
  'Romania': 'RO',
  'Czech Republic': 'CZ',
  'Czechia': 'CZ',
  'Hungary': 'HU',
  'Slovakia': 'SK',
  'Bulgaria': 'BG',
  'Croatia': 'HR',
  'Slovenia': 'SI',
  'Lithuania': 'LT',
  'Latvia': 'LV',
  'Estonia': 'EE',
  'Ireland': 'IE',
  'Luxembourg': 'LU',
  'Malta': 'MT',
  'Cyprus': 'CY'
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id

    // Récupérer l'équipe de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true }
    })

    // Préparer les dates pour le graphique des 7 derniers jours
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    // ⚡ OPTIMISATION ULTRA: Utiliser des agrégations directes
    const linkWhere = {
      OR: [
        { userId },
        ...(user?.teamId ? [{
          teamId: user.teamId,
          teamShared: true
        }] : [])
      ]
    }

    // Requêtes parallèles optimisées
    const [linksAggregate, topLinks, allLinkIds, clickStats] = await Promise.all([
      // 1. Stats agrégées des liens en une seule requête
      prisma.link.aggregate({
        where: linkWhere,
        _count: { id: true },
        _sum: { clicks: true, views: true }
      }),

      // 2. Top 5 liens seulement
      prisma.link.findMany({
        where: linkWhere,
        select: {
          id: true,
          title: true,
          internalName: true,
          slug: true,
          clicks: true,
          views: true
        },
        orderBy: { clicks: 'desc' },
        take: 5
      }),

      // 3. Juste les IDs pour les requêtes Click
      prisma.link.findMany({
        where: linkWhere,
        select: { id: true }
      }),

      // 4. Stats Click en une seule requête groupBy
      prisma.click.groupBy({
        by: ['country'],
        where: {
          link: linkWhere,
          country: { not: 'Unknown' }
        },
        _count: { id: true }
      })
    ])

    const linkIds = allLinkIds.map(l => l.id)

    // Requêtes Click optimisées en parallèle
    const [uniqueVisitors, recentClicks] = await Promise.all([
      // Visiteurs uniques - comptage direct
      prisma.click.groupBy({
        by: ['ip'],
        where: { linkId: { in: linkIds } }
      }),

      // Clics récents - seulement createdAt
      prisma.click.findMany({
        where: {
          linkId: { in: linkIds },
          createdAt: { gte: sevenDaysAgo, lte: today }
        },
        select: { createdAt: true }
      })
    ])

    // Stats calculées
    const totalLinks = linksAggregate._count.id
    const totalClicks = linksAggregate._sum.clicks || 0
    const uniqueVisitorsCount = uniqueVisitors.length

    // Top 5 liens formatés
    const formattedTopLinks = topLinks.map(link => ({
      id: link.id,
      title: link.title,
      internalName: link.internalName,
      slug: link.slug,
      clicks: link.clicks || 0,
      views: link.views || 0,
      _count: {
        analyticsEvents: link.clicks || 0
      }
    }))

    // Top 10 pays
    const topCountries = clickStats
      .sort((a, b) => b._count.id - a._count.id)
      .slice(0, 10)
      .map(item => {
        const countryCode = countryNameToCode[item.country] || item.country
        return [countryCode, item._count.id]
      })

    // Générer les données des 7 derniers jours
    const clicksByDay = new Map()
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      clicksByDay.set(dateKey, 0)
    }

    recentClicks.forEach(click => {
      const dateKey = new Date(click.createdAt).toISOString().split('T')[0]
      if (clicksByDay.has(dateKey)) {
        clicksByDay.set(dateKey, clicksByDay.get(dateKey) + 1)
      }
    })

    const summary = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
      date,
      clicks
    }))

    // Retourner les données avec cache HTTP optimisé
    return NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews: totalClicks,
      uniqueVisitors: uniqueVisitorsCount,
      clicksChange: 0,
      viewsChange: 0,
      visitorsChange: 0,
      topLinks: formattedTopLinks,
      topCountries,
      summary
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        'Pragma': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Erreur dashboard-all:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}