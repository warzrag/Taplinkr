import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Route qui utilise Prisma pour récupérer les dossiers
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json([])
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

    const response = NextResponse.json(folders)

    // Cache de 30 secondes
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    return response

  } catch (error) {
    console.error('❌ Erreur API Folders Direct:', error)
    return NextResponse.json([])
  }
}