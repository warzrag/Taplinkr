import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Version optimisée pour le dashboard - charge uniquement l'essentiel
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ links: [] })
    }

    // Une seule requête optimisée avec les données essentielles
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
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
        // Inclure juste le nombre de multiLinks
        multiLinks: {
          select: {
            id: true
          }
        }
      },
      orderBy: { order: 'asc' }
    })

    // Transformer pour avoir le format attendu
    const formattedLinks = links.map(link => ({
      ...link,
      multiLinksCount: link.multiLinks?.length || 0,
      multiLinks: [] // Pas besoin des détails pour le dashboard
    }))

    return NextResponse.json({
      links: formattedLinks,
      personalLinks: formattedLinks,
      teamLinks: [],
      hasTeam: false,
      count: formattedLinks.length
    })
  } catch (error) {
    console.error('Erreur API fast links:', error)
    return NextResponse.json({ links: [] })
  }
}