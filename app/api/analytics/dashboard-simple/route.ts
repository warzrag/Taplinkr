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

    const userEmail = session.user.email

    // 1. Trouver tous les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: userEmail
      },
      select: {
        id: true
      }
    })
    
    const allUserIds = allUsers.map(u => u.id)
    
    // 2. Compter tous les liens
    const totalLinks = await prisma.link.count({
      where: { 
        userId: { in: allUserIds }
      }
    })

    // 3. Calculer le total des clics - méthode simple
    let totalClicks = 0
    
    // Méthode 1: Compter dans la table Click
    try {
      const clickCount = await prisma.click.count({
        where: { 
          userId: { in: allUserIds }
        }
      })
      totalClicks = Math.max(totalClicks, clickCount)
    } catch (e) {
      console.error('Erreur comptage Click:', e)
    }
    
    // Méthode 2: Somme des clics sur les liens
    try {
      const links = await prisma.link.findMany({
        where: { 
          userId: { in: allUserIds }
        },
        select: { 
          clicks: true,
          views: true 
        }
      })
      
      const sumClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
      const sumViews = links.reduce((sum, link) => sum + (link.views || 0), 0)
      
      totalClicks = Math.max(totalClicks, sumClicks, sumViews)
    } catch (e) {
      console.error('Erreur somme clicks:', e)
    }

    // 4. Compter les visiteurs uniques (simplifié)
    let uniqueVisitors = 0
    try {
      const visitors = await prisma.click.findMany({
        where: {
          userId: { in: allUserIds }
        },
        distinct: ['ip'],
        select: { ip: true }
      })
      uniqueVisitors = visitors.length
    } catch (e) {
      console.error('Erreur visiteurs:', e)
    }

    // 5. Top 5 liens (simplifié)
    let topLinks = []
    try {
      const allLinks = await prisma.link.findMany({
        where: { 
          userId: { in: allUserIds }
        },
        orderBy: {
          clicks: 'desc'
        },
        take: 5,
        select: {
          id: true,
          title: true,
          slug: true,
          clicks: true,
          views: true
        }
      })
      
      topLinks = allLinks.map(link => ({
        id: link.id,
        title: link.title,
        slug: link.slug,
        clicks: Math.max(link.clicks || 0, link.views || 0),
        totalMultiLinkClicks: 0
      }))
    } catch (e) {
      console.error('Erreur top links:', e)
    }

    // Retourner les données essentielles
    return NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews: totalClicks, // Même valeur pour simplifier
      uniqueVisitors,
      clicksChange: 0,
      viewsChange: 0,
      visitorsChange: 0,
      topLinks,
      chartData: {
        labels: [],
        clicks: []
      },
      debug: {
        userIds: allUserIds,
        userCount: allUsers.length
      }
    })

  } catch (error) {
    console.error('Erreur dashboard-simple:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}