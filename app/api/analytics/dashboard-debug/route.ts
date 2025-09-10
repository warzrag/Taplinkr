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

    // 1. Vérifier tous les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    // 2. Pour l'utilisateur actuel (de la session)
    const currentUserLinks = await prisma.link.findMany({
      where: { userId },
      select: {
        id: true,
        title: true,
        clicks: true,
        views: true
      }
    })

    const currentUserClickTable = await prisma.click.count({
      where: { userId }
    })

    // 3. Pour tous les utilisateurs avec le même email
    const allUserStats = await Promise.all(
      allUsers.map(async (user) => {
        const links = await prisma.link.findMany({
          where: { userId: user.id },
          select: {
            clicks: true,
            views: true
          }
        })
        
        const clickTableCount = await prisma.click.count({
          where: { userId: user.id }
        })
        
        return {
          userId: user.id,
          isCurrentUser: user.id === userId,
          linkCount: links.length,
          totalClicksFromLinks: links.reduce((sum, link) => sum + (link.clicks || 0), 0),
          totalViewsFromLinks: links.reduce((sum, link) => sum + (link.views || 0), 0),
          clickTableCount
        }
      })
    )

    // 4. Calculer les statistiques pour l'utilisateur actuel
    const totalClicksFromLinks = currentUserLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViewsFromLinks = currentUserLinks.reduce((sum, link) => sum + (link.views || 0), 0)
    const calculatedTotalClicks = Math.max(currentUserClickTable, totalClicksFromLinks, totalViewsFromLinks)

    // 5. Simuler la réponse de dashboard-fixed
    const simulatedDashboardResponse = {
      totalLinks: currentUserLinks.length,
      totalClicks: calculatedTotalClicks,
      totalViews: calculatedTotalClicks,
      uniqueVisitors: 0,
      clicksChange: 0,
      viewsChange: 0,
      visitorsChange: 0
    }

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email,
        username: session.user.username
      },
      currentUserStats: {
        linkCount: currentUserLinks.length,
        links: currentUserLinks,
        totalClicksFromLinks,
        totalViewsFromLinks,
        clickTableCount: currentUserClickTable,
        finalCalculatedClicks: calculatedTotalClicks
      },
      allUsersWithEmail: allUserStats,
      simulatedDashboardResponse,
      debug: {
        message: "Si totalClicks n'apparaît pas dans le dashboard alors que cette API retourne une valeur, c'est un problème d'affichage dans le frontend",
        dashboardExpects: {
          totalClicks: calculatedTotalClicks,
          format: "dashboardStats?.totalClicks || 0"
        }
      }
    })

  } catch (error) {
    console.error('Erreur debug analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}