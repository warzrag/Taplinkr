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

    // 1. Vérifier TOUTES les entrées dans la table Click
    const allClicks = await prisma.click.findMany({
      select: {
        id: true,
        userId: true,
        linkId: true,
        createdAt: true
      },
      take: 10 // Limiter pour éviter trop de données
    })

    // 2. Vérifier TOUS les liens avec leurs clics
    const allLinks = await prisma.link.findMany({
      select: {
        id: true,
        userId: true,
        title: true,
        clicks: true,
        views: true
      },
      orderBy: {
        clicks: 'desc'
      },
      take: 10
    })

    // 3. Compter le total des clics par différentes méthodes
    const totalClicksInTable = await prisma.click.count()
    
    const allLinksForCount = await prisma.link.findMany({
      select: {
        clicks: true,
        views: true
      }
    })
    
    const totalClicksInLinkColumn = allLinksForCount.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViewsInLinkColumn = allLinksForCount.reduce((sum, link) => sum + (link.views || 0), 0)

    // 4. Vérifier s'il y a des clics pour l'email de l'utilisateur
    const usersWithEmail = await prisma.user.findMany({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        email: true
      }
    })

    const clicksByEmail = await Promise.all(
      usersWithEmail.map(async (user) => {
        const clickCount = await prisma.click.count({
          where: { userId: user.id }
        })
        const links = await prisma.link.findMany({
          where: { userId: user.id },
          select: {
            clicks: true,
            views: true
          }
        })
        return {
          userId: user.id,
          clicksInTable: clickCount,
          totalClicksInLinks: links.reduce((sum, l) => sum + (l.clicks || 0), 0),
          totalViewsInLinks: links.reduce((sum, l) => sum + (l.views || 0), 0)
        }
      })
    )

    return NextResponse.json({
      session: {
        userId: session.user.id,
        email: session.user.email
      },
      globalStats: {
        totalClicksInTable,
        totalClicksInLinkColumn,
        totalViewsInLinkColumn,
        maxPossibleClicks: Math.max(totalClicksInTable, totalClicksInLinkColumn, totalViewsInLinkColumn)
      },
      sampleClicks: allClicks,
      sampleLinks: allLinks,
      usersWithSameEmail: usersWithEmail,
      clicksByUser: clicksByEmail,
      conclusion: {
        hasClicksInTable: totalClicksInTable > 0,
        hasClicksInLinks: totalClicksInLinkColumn > 0,
        hasViews: totalViewsInLinkColumn > 0,
        recommendedTotalClicks: Math.max(totalClicksInTable, totalClicksInLinkColumn, totalViewsInLinkColumn)
      }
    })

  } catch (error) {
    console.error('Erreur check all clicks:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 })
  }
}