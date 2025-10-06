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

    const userId = session.user.id

    // ⚡ Récupérer seulement les infos essentielles en parallèle
    const [folders, unorganizedLinksCount] = await Promise.all([
      prisma.folder.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          _count: {
            select: { links: true }
          }
        }
      }),
      prisma.link.count({
        where: {
          userId,
          folderId: null
        }
      })
    ])

    // Calculer les liens organisés (dans des dossiers)
    const organizedLinks = folders.reduce((sum, folder) => sum + folder._count.links, 0)

    return NextResponse.json({
      totalFolders: folders.length,
      organizedLinks,
      topFolders: folders.filter(f => f._count.links > 0)
    })

  } catch (error) {
    console.error('Erreur folders-simple:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
