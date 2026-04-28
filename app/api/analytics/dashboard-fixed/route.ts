import { NextResponse } from 'next/server'
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
    const userEmail = session.user.email
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    // IMPORTANT: Chercher TOUS les utilisateurs avec cet email
    // Car les liens peuvent être associés à différents user IDs
    const allUsers = await prisma.user.findMany({
      where: {
        email: userEmail
      },
      select: {
        id: true
      }
    })
    
    const allUserIds = allUsers.map(u => u.id)
    
    // Compter le total des liens pour TOUS les utilisateurs avec cet email
    const totalLinks = await prisma.link.count({
      where: { 
        userId: { in: allUserIds }
      }
    })

    // FORCER LE COMPTAGE DE TOUS LES CLICS DE TOUS LES LIENS
    // Méthode 1: Compter directement dans la table Click pour TOUS les user IDs
    const totalClicksFromClickTable = await prisma.click.count({
      where: { 
        userId: { in: allUserIds }
      }
    })
    
    // Méthode 2: Somme des clics sur les liens pour TOUS les user IDs
    const links = await prisma.link.findMany({
      where: { 
        userId: { in: allUserIds }
      },
      select: { 
        clicks: true,
        views: true 
      }
    })
    
    const totalClicksFromLinks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViewsFromLinks = links.reduce((sum, link) => sum + (link.views || 0), 0)
    
    // Debug logs
    console.log('Dashboard Stats Debug:', {
      currentUserId: userId,
      allUserIds,
      linksCount: links.length,
      totalClicksFromLinks,
      totalViewsFromLinks,
      totalClicksFromClickTable
    })
    
    // Prendre le maximum des trois pour être sûr
    const totalClicks = Math.max(totalClicksFromClickTable, totalClicksFromLinks, totalViewsFromLinks)

    // Pour les vues, on utilise le même nombre que les clics
    const totalViews = totalClicks

    // Compter les visiteurs uniques (IPs uniques) pour TOUS les user IDs
    const uniqueVisitors = await prisma.click.findMany({
      where: {
        userId: { in: allUserIds },
        createdAt: { gte: thirtyDaysAgo }
      },
      distinct: ['ip'],
      select: { ip: true }
    })

    // Pour le moment, on met les changements à 0
    // On pourrait calculer le changement sur les 30 derniers jours vs les 30 jours d'avant
    const clicksChange = 0

    // Top 5 des liens les plus cliqués (prendre en compte clicks ET views) pour TOUS les user IDs
    const allLinks = await prisma.link.findMany({
      where: { 
        userId: { in: allUserIds }
      },
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

    // Daily clicks aggregated client-side (Firestore has no GROUP BY)
    const recentClicks = await prisma.click.findMany({
      where: { userId: { in: allUserIds }, createdAt: { gte: thirtyDaysAgo } },
    })
    const dailyClicksMap = new Map<string, number>()
    for (const c of recentClicks) {
      const d = c.createdAt instanceof Date ? c.createdAt : new Date(c.createdAt)
      const key = d.toISOString().slice(0, 10)
      dailyClicksMap.set(key, (dailyClicksMap.get(key) || 0) + 1)
    }
    const dailyClicks = Array.from(dailyClicksMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }))

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