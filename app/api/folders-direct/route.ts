import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'

// Route qui utilise Prisma pour récupérer les dossiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
    }

    // Cache key unique par utilisateur
    const cacheKey = `folders-direct:user:${session.user.id}`

    // Vérifier le cache
    const cached = await cache.get(cacheKey)
    if (cached) {
      const response = NextResponse.json(cached)
      response.headers.set('X-Cache', 'HIT')
      return response
    }

    // ⚡ Optimisation: charger seulement les champs nécessaires
    const folders = await prisma.folder.findMany({
      where: {
        userId: session.user.id,
        parentId: null // Charger directement les dossiers racine
      },
      orderBy: { order: 'asc' },
      include: {
        links: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            title: true,
            slug: true,
            icon: true,
            color: true,
            clicks: true,
            views: true,
            isActive: true,
            isDirect: true,
            order: true,
            folderId: true,
            // Ne pas charger les multiLinks ici
            _count: {
              select: { multiLinks: true }
            }
          }
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            links: {
              orderBy: { order: 'asc' },
              select: {
                id: true,
                title: true,
                slug: true,
                icon: true,
                color: true,
                clicks: true,
                views: true,
                isActive: true,
                isDirect: true,
                order: true,
                folderId: true,
                _count: {
                  select: { multiLinks: true }
                }
              }
            }
          }
        }
      }
    })

    // Mettre en cache 60s
    await cache.set(cacheKey, folders, 60)

    const response = NextResponse.json(folders)
    response.headers.set('X-Cache', 'MISS')
    response.headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')

    return response

  } catch (error) {
    console.error('❌ Erreur API Folders Direct:', error)
    return NextResponse.json([])
  }
}