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

    // FORCER LE COMPTAGE DE TOUS LES CLICS DE TOUS LES LIENS
    // Méthode 1: Compter directement dans la table Click
    const totalClicksFromClickTable = await prisma.click.count({
      where: { userId }
    })
    
    // Méthode 2: Somme des clics sur les liens
    const links = await prisma.link.findMany({
      where: { userId },
      select: { 
        clicks: true,
        views: true 
      }
    })
    
    const totalClicksFromLinks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViewsFromLinks = links.reduce((sum, link) => sum + (link.views || 0), 0)
    
    // Prendre le maximum des deux pour être sûr
    const totalClicks = Math.max(totalClicksFromClickTable, totalClicksFromLinks, totalViewsFromLinks)

    // Pour les vues, on utilise le même nombre que les clics
    const totalViews = totalClicks

    // Compter les visiteurs uniques (IPs uniques)
    const uniqueVisitors = await prisma.click.findMany({
      where: {
        userId,
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['ip'],
      select: { ip: true }
    })

    // Pour le moment, on met les changements à 0
    // On pourrait calculer le changement sur les 30 derniers jours vs les 30 jours d'avant
    const clicksChange = 0

    // Top 5 des liens les plus cliqués (prendre en compte clicks ET views)
    const allLinks = await prisma.link.findMany({
      where: { userId },
      include: {
        multiLinks: {
          select: { clicks: true }
        }
      }
    })
    
    // Trier par le maximum entre clicks et views
    const topLinks = allLinks
      .map(link => ({
        ...link,
        totalScore: Math.max(link.clicks || 0, link.views || 0)
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, 5)

    // Données pour le graphique (30 derniers jours) - basé sur la table Click
    const dailyClicks = await prisma.$queryRaw`
      SELECT 
        DATE("createdAt") as date,
        COUNT(*) as count
      FROM "Click"
      WHERE "userId" = ${userId}
        AND "createdAt" >= ${thirtyDaysAgo}
      GROUP BY DATE("createdAt")
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
        clicks: Math.max(link.clicks || 0, link.views || 0),
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