import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'

// Version optimisée pour le dashboard - charge uniquement l'essentiel
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ links: [] })
    }

    const cacheKey = `links:user:${session.user.id}`

    // Essayer le cache Redis-like d'abord
    const cached = await cache.get(cacheKey)
    if (cached) {
      console.log(`✅ Cache hit pour user ${session.user.id}`)
      return NextResponse.json(cached)
    }

    console.log(`❌ Cache miss pour user ${session.user.id}`)

    // Récupérer l'équipe de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true }
    })

    // Une seule requête optimisée avec les données essentielles
    // Inclure à la fois les liens personnels ET les liens d'équipe partagés
    const links = await prisma.link.findMany({
      where: {
        OR: [
          { userId: session.user.id },  // Mes liens personnels
          ...(user?.teamId ? [{
            teamId: user.teamId,         // Liens de mon équipe
            teamShared: true
          }] : [])
        ]
      },
      select: {
        id: true,
        slug: true,
        title: true,
        internalName: true,
        description: true,
        icon: true,
        color: true,
        coverImage: true,
        profileImage: true,
        clicks: true,
        views: true,
        isActive: true,
        isDirect: true,
        directUrl: true,
        order: true,
        createdAt: true,
        updatedAt: true,
        teamShared: true,
        userId: true,
        // Utiliser _count au lieu de charger les multiLinks
        _count: {
          select: { multiLinks: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Transformer pour avoir le format attendu
    const formattedLinks = links.map(link => ({
      ...link,
      multiLinksCount: link._count?.multiLinks || 0,
      multiLinks: [] // Pas besoin des détails pour le dashboard
    }))

    const response = {
      links: formattedLinks,
      personalLinks: formattedLinks,
      teamLinks: [],
      hasTeam: false,
      count: formattedLinks.length
    }

    // Mettre en cache pour 60 secondes avec le cache Redis-like
    await cache.set(cacheKey, response, 60)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Erreur API fast links:', error)
    return NextResponse.json({ links: [] })
  }
}