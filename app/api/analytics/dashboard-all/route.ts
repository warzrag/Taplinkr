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
    
    // 1. Compter les liens de l'utilisateur actuel
    const totalLinks = await prisma.link.count({
      where: { userId: session.user.id }
    })

    // 2. Calculer le total des clics - seulement pour l'utilisateur actuel
    let totalClicks = 0
    
    // Méthode 1: Compter dans la table Click pour cet utilisateur
    try {
      const clickCount = await prisma.click.count({
        where: { userId: session.user.id }
      })
      totalClicks = Math.max(totalClicks, clickCount)
    } catch (e) {
      console.error('Erreur comptage Click:', e)
    }
    
    // Méthode 2: Somme des clics sur les liens de l'utilisateur
    try {
      const links = await prisma.link.findMany({
        where: { userId: session.user.id },
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

    // 3. Compter les visiteurs uniques pour cet utilisateur
    let uniqueVisitors = 0
    try {
      const visitors = await prisma.click.findMany({
        where: { userId: session.user.id },
        distinct: ['ip'],
        select: { ip: true }
      })
      uniqueVisitors = visitors.length
    } catch (e) {
      console.error('Erreur visiteurs:', e)
    }

    // 4. Top 5 liens de l'utilisateur
    let topLinks = []
    try {
      const allLinks = await prisma.link.findMany({
        where: { userId: session.user.id },
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

    // 5. Top 10 pays pour cet utilisateur
    let topCountries = []
    try {
      const countryCounts = await prisma.click.groupBy({
        by: ['country'],
        where: {
          userId: session.user.id,
          country: { not: 'Unknown' } // Exclure Unknown
        },
        _count: { country: true }
      })

      topCountries = countryCounts
        .sort((a, b) => b._count.country - a._count.country)
        .slice(0, 10)
        .map(item => [item.country, item._count.country])

      console.log('📊 Top 10 pays:', topCountries)
    } catch (e) {
      console.error('Erreur top countries:', e)
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
      topCountries,
      chartData: {
        labels: [],
        clicks: []
      },
      debug: {
        message: "Affichage des clics de l'utilisateur actuel uniquement",
        currentUser: session.user.email,
        userId: session.user.id
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