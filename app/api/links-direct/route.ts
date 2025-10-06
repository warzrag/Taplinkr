import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route simplifiée qui utilise Prisma
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // ⚡ Optimisation: charger seulement les champs essentiels
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        icon: true,
        color: true,
        coverImage: true,
        profileImage: true,
        profileStyle: true,
        clicks: true,
        views: true,
        isActive: true,
        isDirect: true,
        directUrl: true,
        order: true,
        folderId: true,
        createdAt: true,
        updatedAt: true,
        // Charger seulement le count des multiLinks, pas tous les détails
        _count: {
          select: { multiLinks: true }
        }
      }
    })

    const response = NextResponse.json(links)

    // Cache de 30 secondes
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    return response
    
  } catch (error) {
    console.error('❌ Erreur API Links Direct:', error)
    return NextResponse.json([])
  }
}