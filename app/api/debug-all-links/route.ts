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

    // 1. Récupérer TOUS les liens de la base
    const allLinks = await prisma.link.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        clicks: true,
        views: true,
        userId: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        clicks: 'desc'
      }
    })

    // 2. Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true
      }
    })

    // 3. Grouper les liens par utilisateur
    const linksByUser = allUsers.map(user => ({
      userId: user.id,
      email: user.email,
      username: user.username,
      links: allLinks.filter(link => link.userId === user.id),
      totalClicks: allLinks
        .filter(link => link.userId === user.id)
        .reduce((sum, link) => sum + (link.clicks || 0), 0)
    }))

    // 4. Calculer les totaux
    const totalClicks = allLinks.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViews = allLinks.reduce((sum, link) => sum + (link.views || 0), 0)

    return NextResponse.json({
      currentUser: {
        id: session.user.id,
        email: session.user.email
      },
      summary: {
        totalLinks: allLinks.length,
        totalClicks,
        totalViews,
        totalUsers: allUsers.length
      },
      allLinks,
      linksByUser: linksByUser.filter(u => u.links.length > 0),
      debug: {
        message: "Affichage de TOUS les liens de la base de données"
      }
    })

  } catch (error) {
    console.error('Erreur debug all links:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 })
  }
}