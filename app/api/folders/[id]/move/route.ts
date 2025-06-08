import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - Déplacer un dossier dans un autre dossier
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { parentId } = body
    const folderId = params.id

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Vérifier que le dossier à déplacer appartient à l'utilisateur
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Vérifier que le dossier parent existe si fourni
    if (parentId) {
      const parentFolder = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId: user.id
        }
      })

      if (!parentFolder) {
        return NextResponse.json({ error: 'Dossier parent introuvable' }, { status: 404 })
      }

      // Empêcher de déplacer un dossier dans lui-même ou dans ses descendants
      const isDescendant = await checkIfDescendant(folderId, parentId)
      if (folderId === parentId || isDescendant) {
        return NextResponse.json({ error: 'Impossible de déplacer un dossier dans lui-même ou ses sous-dossiers' }, { status: 400 })
      }
    }

    // Calculer le nouvel ordre
    const lastFolder = await prisma.folder.findFirst({
      where: {
        userId: user.id,
        parentId: parentId || null
      },
      orderBy: { order: 'desc' }
    })

    // Déplacer le dossier
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        parentId: parentId || null,
        order: (lastFolder?.order || 0) + 1
      }
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error('Erreur lors du déplacement du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Fonction pour vérifier si un dossier est un descendant d'un autre
async function checkIfDescendant(folderId: string, potentialAncestorId: string): Promise<boolean> {
  const folder = await prisma.folder.findUnique({
    where: { id: folderId },
    include: { parent: true }
  })

  if (!folder || !folder.parent) {
    return false
  }

  if (folder.parent.id === potentialAncestorId) {
    return true
  }

  return checkIfDescendant(folder.parent.id, potentialAncestorId)
}