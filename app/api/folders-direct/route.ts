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

    // Récupérer les dossiers avec Prisma
    const folders = await prisma.folder.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
      include: {
        links: {
          orderBy: { order: 'asc' }
        },
        children: {
          orderBy: { order: 'asc' },
          include: {
            links: {
              orderBy: { order: 'asc' }
            }
          }
        }
      }
    })

    // Filtrer pour ne garder que les dossiers racine
    const rootFolders = folders.filter(f => !f.parentId)

    console.log(`✅ API Folders Direct: ${rootFolders.length} dossiers trouvés`)
    return NextResponse.json(rootFolders)

  } catch (error) {
    console.error('❌ Erreur API Folders Direct:', error)
    return NextResponse.json([])
  }
}