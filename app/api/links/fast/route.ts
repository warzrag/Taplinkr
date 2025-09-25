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

    // Une seule requête optimisée
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        icon: true,
        color: true,
        clicks: true,
        views: true,
        isActive: true,
        isDirect: true,
        directUrl: true,
        order: true,
        createdAt: true,
        // Compter les multiLinks au lieu de les charger
        _count: {
          select: { multiLinks: true }
        }
      },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({
      links,
      count: links.length
    })
  } catch (error) {
    console.error('Erreur API fast links:', error)
    return NextResponse.json({ links: [] })
  }
}