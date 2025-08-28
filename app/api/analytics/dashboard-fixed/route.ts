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

    // Calculer le total des clics (somme de tous les clicks sur tous les liens)
    const links = await prisma.link.findMany({
      where: { userId },
      select: { 
        id: true,
        title: true,
        clicks: true 
      }
    })
    
    console.log('Debug - UserId:', userId)
    console.log('Debug - Links trouvés:', links.length)
    console.log('Debug - Détail des liens:', links.map(l => ({ id: l.id, title: l.title, clicks: l.clicks })))
    
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
    console.log('Debug - Total des clics calculé:', totalClicks)

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