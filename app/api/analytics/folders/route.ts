import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session analytics folders:', session)
    
    if (!session?.user?.email) {
      console.log('Pas de session ou email:', session)
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    console.log('Recherche des dossiers pour:', session.user.email)

    // Récupérer tous les dossiers avec leurs liens et analytics
    const folders = await prisma.folder.findMany({
      where: {
        user: { email: session.user.email }
      },
      include: {
        links: {
          include: {
            _count: {
              select: { analyticsEvents: true }
            },
            analyticsEvents: {
              orderBy: { createdAt: 'desc' },
              take: 100
            }
          }
        },
        children: {
          include: {
            links: {
              include: {
                _count: {
                  select: { analyticsEvents: true }
                }
              }
            }
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    console.log('Dossiers trouvés:', folders.length)
    console.log('Dossiers détails:', folders)

    // Calculer les statistiques pour chaque dossier
    const folderAnalytics = folders.map(folder => {
      // Clics directs du dossier
      const directClicks = folder.links.reduce((sum, link) => 
        sum + (link._count?.analyticsEvents || 0), 0
      )
      
      // Clics des sous-dossiers
      const childrenClicks = folder.children.reduce((sum, child) => 
        sum + child.links.reduce((linkSum, link) => 
          linkSum + (link._count?.analyticsEvents || 0), 0
        ), 0
      )

      // Analyser les tendances sur les 30 derniers jours
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const recentEvents = folder.links.flatMap(link => 
        link.analyticsEvents.filter(event => 
          new Date(event.createdAt) >= thirtyDaysAgo
        )
      )

      // Calculer les clics par jour pour le graphique
      const clicksByDay: { [key: string]: number } = {}
      for (let i = 0; i < 30; i++) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateKey = date.toISOString().split('T')[0]
        clicksByDay[dateKey] = 0
      }

      recentEvents.forEach(event => {
        const dateKey = new Date(event.createdAt).toISOString().split('T')[0]
        if (clicksByDay.hasOwnProperty(dateKey)) {
          clicksByDay[dateKey]++
        }
      })

      // Top liens du dossier
      const topLinks = folder.links
        .map(link => ({
          id: link.id,
          title: link.title,
          slug: link.slug,
          clicks: link._count?.analyticsEvents || 0,
          icon: link.icon
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5)

      return {
        id: folder.id,
        name: folder.name,
        icon: folder.icon,
        color: folder.color,
        description: folder.description,
        totalClicks: directClicks + childrenClicks,
        directClicks,
        childrenClicks,
        linksCount: folder.links.length,
        childrenCount: folder.children.length,
        clicksByDay: Object.entries(clicksByDay)
          .map(([date, clicks]) => ({ date, clicks }))
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
        topLinks,
        growthRate: calculateGrowthRate(clicksByDay),
        hasChildren: folder.children.length > 0
      }
    })

    // Récupérer aussi les liens sans dossier
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const unorganizedLinks = await prisma.link.findMany({
      where: {
        user: { email: session.user.email },
        folderId: null
      },
      include: {
        _count: {
          select: { analyticsEvents: true }
        },
        analyticsEvents: {
          where: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })

    const unorganizedClicks = unorganizedLinks.reduce((sum, link) => 
      sum + (link._count?.analyticsEvents || 0), 0
    )

    // Analytics pour les liens non organisés
    const unorganizedClicksByDay: { [key: string]: number } = {}
    for (let i = 0; i < 30; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateKey = date.toISOString().split('T')[0]
      unorganizedClicksByDay[dateKey] = 0
    }

    unorganizedLinks.forEach(link => {
      link.analyticsEvents.forEach(event => {
        const dateKey = new Date(event.createdAt).toISOString().split('T')[0]
        if (unorganizedClicksByDay.hasOwnProperty(dateKey)) {
          unorganizedClicksByDay[dateKey]++
        }
      })
    })

    const unorganizedAnalytics = {
      id: 'unorganized',
      name: 'Liens libres',
      icon: '🔗',
      color: '#10b981',
      totalClicks: unorganizedClicks,
      linksCount: unorganizedLinks.length,
      clicksByDay: Object.entries(unorganizedClicksByDay)
        .map(([date, clicks]) => ({ date, clicks }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      topLinks: unorganizedLinks
        .map(link => ({
          id: link.id,
          title: link.title,
          slug: link.slug,
          clicks: link._count?.analyticsEvents || 0,
          icon: link.icon
        }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5),
      growthRate: calculateGrowthRate(unorganizedClicksByDay)
    }

    const result = {
      folders: folderAnalytics,
      unorganized: unorganizedAnalytics,
      totalClicks: folderAnalytics.reduce((sum, f) => sum + f.totalClicks, 0) + unorganizedClicks
    }

    console.log('Résultat final:', result)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics des dossiers:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

function calculateGrowthRate(clicksByDay: { [key: string]: number }): number {
  const dates = Object.keys(clicksByDay).sort()
  if (dates.length < 14) return 0

  // Comparer les 7 derniers jours avec les 7 jours précédents
  const lastWeek = dates.slice(-7)
  const previousWeek = dates.slice(-14, -7)

  const lastWeekClicks = lastWeek.reduce((sum, date) => sum + clicksByDay[date], 0)
  const previousWeekClicks = previousWeek.reduce((sum, date) => sum + clicksByDay[date], 0)

  if (previousWeekClicks === 0) return lastWeekClicks > 0 ? 100 : 0

  return Math.round(((lastWeekClicks - previousWeekClicks) / previousWeekClicks) * 100)
}