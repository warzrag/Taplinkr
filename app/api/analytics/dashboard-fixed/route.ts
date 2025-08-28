import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // Compter le total des liens
    const totalLinks = await prisma.link.count({
      where: { userId }
    })

    // Compter le total des clics dans la table Click
    const totalClicks = await prisma.click.count({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      }
    })

    // Calculer le total des vues (somme des clicks sur tous les liens)
    const links = await prisma.link.findMany({
      where: { userId },
      select: { clicks: true }
    })
    
    const totalViews = links.reduce((sum, link) => sum + (link.clicks || 0), 0)

    // Compter les visiteurs uniques (IPs uniques)
    const uniqueVisitors = await prisma.click.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['ip'],
      select: { ip: true }
    })

    // Stats pour la période précédente (pour comparaison)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)
    
    const previousPeriodClicks = await prisma.click.count({
      where: {
        userId,
        createdAt: {
          gte: sixtyDaysAgo,
          lt: thirtyDaysAgo
        }
      }
    })

    // Calcul des pourcentages de changement
    const clicksChange = previousPeriodClicks > 0 
      ? ((totalClicks - previousPeriodClicks) / previousPeriodClicks) * 100
      : totalClicks > 0 ? 100 : 0

    // Top 5 des liens les plus cliqués
    const topLinks = await prisma.link.findMany({
      where: { userId },
      orderBy: { clicks: 'desc' },
      take: 5,
      include: {
        multiLinks: {
          select: { clicks: true }
        }
      }
    })

    // Données pour le graphique (30 derniers jours)
    const dailyClicks = await prisma.$queryRaw`
      SELECT 
        DATE(createdAt) as date,
        COUNT(*) as count
      FROM clicks
      WHERE userId = ${userId}
        AND createdAt >= ${thirtyDaysAgo}
      GROUP BY DATE(createdAt)
      ORDER BY date ASC
    ` as any[]

    return NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      clicksChange: Math.round(clicksChange),
      viewsChange: 0, // Pour simplifier
      visitorsChange: 0, // Pour simplifier
      topLinks: topLinks.map(link => ({
        id: link.id,
        title: link.title,
        slug: link.slug,
        clicks: link.clicks,
        totalMultiLinkClicks: link.multiLinks.reduce((sum, ml) => sum + ml.clicks, 0)
      })),
      chartData: {
        labels: dailyClicks.map(d => d.date),
        clicks: dailyClicks.map(d => Number(d.count))
      }
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des stats dashboard:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}