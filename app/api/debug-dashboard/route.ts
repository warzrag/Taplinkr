import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const userId = session.user.id
    const userEmail = session.user.email

    // 1. Vérifier tous les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: userEmail
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    // 2. Compter les liens pour chaque utilisateur
    const userLinkCounts = await Promise.all(
      allUsers.map(async (user) => {
        const linkCount = await prisma.link.count({
          where: { userId: user.id }
        })
        const links = await prisma.link.findMany({
          where: { userId: user.id },
          select: {
            id: true,
            title: true,
            clicks: true,
            views: true
          }
        })
        return {
          userId: user.id,
          linkCount,
          links,
          totalClicks: links.reduce((sum, link) => sum + (link.clicks || 0), 0),
          totalViews: links.reduce((sum, link) => sum + (link.views || 0), 0)
        }
      })
    )

    // 3. Vérifier les clics dans la table Click
    const clickCounts = await Promise.all(
      allUsers.map(async (user) => {
        const count = await prisma.click.count({
          where: { userId: user.id }
        })
        return {
          userId: user.id,
          clickCount: count
        }
      })
    )

    // 4. Appeler l'API dashboard-fixed pour voir ce qu'elle retourne
    let dashboardStats = null
    try {
      const dashboardResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analytics/dashboard-fixed`, {
        headers: {
          cookie: `next-auth.session-token=${session.sessionToken || ''}; next-auth.callback-url=${process.env.NEXTAUTH_URL || 'http://localhost:3000'}`
        }
      })
      if (dashboardResponse.ok) {
        dashboardStats = await dashboardResponse.json()
      }
    } catch (e) {
      console.error('Erreur appel dashboard:', e)
    }

    // 5. Test direct avec l'API actuelle
    const currentUserId = session.user.id
    const totalClicksFromClickTable = await prisma.click.count({
      where: { userId: currentUserId }
    })
    
    const linksForStats = await prisma.link.findMany({
      where: { userId: currentUserId },
      select: { 
        clicks: true,
        views: true 
      }
    })
    
    const totalClicksFromLinks = linksForStats.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViewsFromLinks = linksForStats.reduce((sum, link) => sum + (link.views || 0), 0)
    
    const calculatedTotalClicks = Math.max(totalClicksFromClickTable, totalClicksFromLinks, totalViewsFromLinks)

    return NextResponse.json({
      currentSession: {
        userId: session.user.id,
        email: session.user.email,
        username: session.user.username
      },
      allUsers,
      linkData: userLinkCounts,
      clickTableData: clickCounts,
      dashboardApiResponse: dashboardStats,
      calculatedStats: {
        totalClicksFromClickTable,
        totalClicksFromLinks,
        totalViewsFromLinks,
        finalTotalClicks: calculatedTotalClicks
      },
      debug: {
        totalLinksAcrossAllUsers: userLinkCounts.reduce((sum, u) => sum + u.linkCount, 0),
        totalClicksAcrossAllUsers: userLinkCounts.reduce((sum, u) => sum + u.totalClicks, 0),
        totalClicksInClickTable: clickCounts.reduce((sum, u) => sum + u.clickCount, 0)
      }
    })

  } catch (error) {
    console.error('Erreur debug dashboard:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 })
  }
}