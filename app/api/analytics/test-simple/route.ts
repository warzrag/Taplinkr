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

    // Test très simple : compter TOUS les liens et TOUS les clics
    const totalLinks = await prisma.link.count()
    const totalClicks = await prisma.click.count()
    
    // Récupérer la somme de tous les clics dans la colonne clicks
    const allLinks = await prisma.link.findMany({
      select: {
        clicks: true,
        views: true
      }
    })
    
    const sumClicks = allLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const sumViews = allLinks.reduce((sum, link) => sum + (link.views || 0), 0)

    // Test de l'API dashboard-fixed
    let dashboardResponse = null
    try {
      const res = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/analytics/dashboard-fixed`, {
        headers: {
          cookie: `next-auth.session-token=${session.sessionToken || ''}`
        }
      })
      if (res.ok) {
        dashboardResponse = await res.json()
      } else {
        dashboardResponse = { error: 'Failed', status: res.status }
      }
    } catch (e) {
      dashboardResponse = { error: e.message }
    }

    return NextResponse.json({
      database: {
        totalLinksInDB: totalLinks,
        totalClicksInClickTable: totalClicks,
        sumClicksInLinkColumn: sumClicks,
        sumViewsInLinkColumn: sumViews,
        maxPossible: Math.max(totalClicks, sumClicks, sumViews)
      },
      dashboardApiResponse: dashboardResponse,
      debug: {
        sessionEmail: session.user.email,
        sessionUserId: session.user.id,
        message: "Si maxPossible > 0 mais dashboard affiche 0, c'est un problème d'affichage"
      }
    })

  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur',
      details: error.message 
    }, { status: 500 })
  }
}