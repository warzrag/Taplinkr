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

    // ⚡ OPTIMISATION: Récupérer tous les liens (personnels + équipe)
    const allLinks = await prisma.link.findMany({
      where: {
        OR: [
          { userId },  // Mes liens
          ...(user?.teamId ? [{
            teamId: user.teamId,  // Liens d'équipe
            teamShared: true
          }] : [])
        ]
      },
      select: {
        id: true,
        title: true,
        slug: true,
        clicks: true,
        views: true
      },
      orderBy: { clicks: 'desc' }
    })

    // Récupérer les IDs de tous les liens (personnels + équipe)
    const allLinkIds = allLinks.map(link => link.id)

    // Maintenant récupérer les clicks pour TOUS ces liens
    const [actualUniqueVisitors, actualCountryCounts, actualRecentClicks] = await Promise.all([
      // Visiteurs uniques sur tous les liens
      prisma.click.findMany({
        where: { linkId: { in: allLinkIds } },
        distinct: ['ip'],
        select: { ip: true }
      }),

      // Top pays sur tous les liens
      prisma.click.groupBy({
        by: ['country'],
        where: {
          linkId: { in: allLinkIds },
          country: { not: 'Unknown' }
        },
        _count: { country: true }
      }),

      // Clics des 7 derniers jours sur tous les liens
      prisma.click.findMany({
        where: {
          linkId: { in: allLinkIds },
          createdAt: {
            gte: sevenDaysAgo,
            lte: today
          }
        },
        select: { createdAt: true }
      })
    ])

    // Calculer les stats à partir des données récupérées
    const totalLinks = allLinks.length
    const totalClicks = allLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const uniqueVisitorsCount = actualUniqueVisitors.length

    // Top 5 liens (déjà triés par clicks desc)
    const topLinks = allLinks.slice(0, 5).map(link => ({
      id: link.id,
      title: link.title,
      slug: link.slug,
      clicks: link.clicks || 0,
      views: link.views || 0,
      _count: {
        analyticsEvents: link.clicks || 0
      }
    }))

    // Top 10 pays
    const topCountries = actualCountryCounts
      .sort((a, b) => b._count.country - a._count.country)
      .slice(0, 10)
      .map(item => {
        const countryCode = countryNameToCode[item.country] || item.country
        return [countryCode, item._count.country]
      })

    // Générer les données des 7 derniers jours
    const clicksByDay = new Map()
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      const dateKey = date.toISOString().split('T')[0]
      clicksByDay.set(dateKey, 0)
    }

    actualRecentClicks.forEach(click => {
      const dateKey = new Date(click.createdAt).toISOString().split('T')[0]
      if (clicksByDay.has(dateKey)) {
        clicksByDay.set(dateKey, clicksByDay.get(dateKey) + 1)
      }
    })

    const summary = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
      date,
      clicks
    }))

    // Retourner les données avec cache HTTP
    const response = NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews: totalClicks,
      uniqueVisitors: uniqueVisitorsCount,
      clicksChange: 0,
      viewsChange: 0,
      visitorsChange: 0,
      topLinks,
      topCountries,
      summary
    })

    // Cache de 30 secondes pour éviter les requêtes répétées
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    return response

  } catch (error) {
    console.error('Erreur dashboard-all:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}