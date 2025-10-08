import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'

// Route qui utilise Prisma pour récupérer les dossiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    console.log('🔍 [folders-direct] Requête GET reçue')

    if (!session?.user?.email) {
      console.error('❌ [folders-direct] Pas de session ou email')
      return NextResponse.json([])
    }

    console.log('🔍 [folders-direct] Session:', {
      email: session.user.email,
      hasId: !!session.user.id
    })

    // 🔥 RÉCUPÉRER L'UTILISATEUR VIA EMAIL (comme /api/folders)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true }
    })

    if (!user) {
      console.error('❌ [folders-direct] Utilisateur non trouvé:', session.user.email)
      return NextResponse.json([])
    }

    console.log('✅ [folders-direct] Utilisateur trouvé:', {
      id: user.id,
      hasTeam: !!user.teamId
    })

    // Cache key unique par utilisateur
    const cacheKey = `folders-direct:user:${user.id}`

    // Vérifier le cache
    const cached = await cache.get(cacheKey)
    if (cached) {
      console.log('✅ [folders-direct] Cache HIT')
      const response = NextResponse.json(cached)
      response.headers.set('X-Cache', 'HIT')
      return response
    }

    console.log('⚡ [folders-direct] Cache MISS - Requête DB')

    // ⚡ Optimisation: charger seulement les champs nécessaires + dossiers d'équipe
    const folders = await prisma.folder.findMany({
      where: {
        OR: [
          { userId: user.id },
          ...(user.teamId ? [{
            teamId: user.teamId,
            teamShared: true
          }] : [])
        ],
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

    console.log('✅ [folders-direct] Dossiers trouvés:', {
      count: folders.length,
      names: folders.map(f => f.name)
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