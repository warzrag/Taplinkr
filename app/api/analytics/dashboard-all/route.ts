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

    // Pour le moment, on affiche TOUS les clics de la plateforme
    // (on corrigera plus tard pour filtrer par utilisateur)
    
    // 1. Compter TOUS les liens
    const totalLinks = await prisma.link.count()

    // 2. Calculer le total des clics - TOUTES les méthodes
    let totalClicks = 0
    
    // Méthode 1: Compter dans la table Click
    try {
      const clickCount = await prisma.click.count()
      totalClicks = Math.max(totalClicks, clickCount)
    } catch (e) {
      console.error('Erreur comptage Click:', e)
    }
    
    // Méthode 2: Somme des clics sur TOUS les liens
    try {
      const links = await prisma.link.findMany({
        select: { 
          clicks: true,
          views: true 
        }
      })
      
      const sumClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
      const sumViews = links.reduce((sum, link) => sum + (link.views || 0), 0)
      
      // Utiliser seulement la somme des clics (pas les vues)
      totalClicks = sumClicks
    } catch (e) {
      console.error('Erreur somme clicks:', e)
    }

    // 3. Compter les visiteurs uniques
    let uniqueVisitors = 0
    try {
      const visitors = await prisma.click.findMany({
        distinct: ['ip'],
        select: { ip: true }
      })
      uniqueVisitors = visitors.length
    } catch (e) {
      console.error('Erreur visiteurs:', e)
    }

    // 4. Top 5 liens
    let topLinks = []
    try {
      const allLinks = await prisma.link.findMany({
        orderBy: [
          { clicks: 'desc' },
          { views: 'desc' }
        ],
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

    // Retourner les données
    return NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews: totalClicks,
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
        message: "Affichage de TOUS les clics de la plateforme",
        currentUser: session.user.email
      }
    })

  } catch (error) {
    console.error('Erreur dashboard-all:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message
    }, { status: 500 })
  }
}