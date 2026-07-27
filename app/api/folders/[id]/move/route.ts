import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'

// PUT - Déplacer un dossier dans un autre dossier
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { parentId } = body
    const folderId = params.id

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Vérifier que le dossier à déplacer appartient à l'utilisateur
    const folder = await prisma.folder.findUnique({
      where: { id: folderId },
    })

    if (!folder || folder.userId !== user.id) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Vérifier que le dossier parent existe si fourni
    if (parentId) {
      const parentFolder = await prisma.folder.findUnique({
        where: { id: parentId },
      })

      if (!parentFolder || parentFolder.userId !== user.id) {
        return NextResponse.json({ error: 'Parent folder not found' }, { status: 404 })
      }

      // Empêcher de déplacer un dossier dans lui-même ou dans ses descendants
      const createsCycle = await wouldCreateCycle(folderId, parentId)
      if (folderId === parentId || createsCycle) {
        return NextResponse.json({ error: 'A folder cannot be moved into itself or one of its subfolders' }, { status: 400 })
      }
    }

    // Calculer le nouvel ordre
    const ownedFolders = await prisma.folder.findMany({
      where: { userId: user.id },
      select: { id: true, parentId: true, order: true },
    })
    const highestSiblingOrder = ownedFolders
      .filter(candidate => candidate.id !== folderId)
      .filter(candidate => (candidate.parentId || null) === (parentId || null))
      .reduce((highest, candidate) => Math.max(highest, candidate.order || 0), 0)

    // Déplacer le dossier
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        parentId: parentId || null,
        order: highestSiblingOrder + 1
      }
    })

    return NextResponse.json(updatedFolder)
  } catch (error) {
    console.error('Erreur lors du déplacement du dossier:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// Fonction pour vérifier si un dossier est un descendant d'un autre
async function wouldCreateCycle(folderId: string, proposedParentId: string): Promise<boolean> {
  const visited = new Set<string>()
  let currentId: string | null = proposedParentId

  while (currentId && !visited.has(currentId)) {
    if (currentId === folderId) return true
    visited.add(currentId)
    const folder = await prisma.folder.findUnique({
      where: { id: currentId },
      select: { parentId: true },
    })
    currentId = folder?.parentId || null
  }

  return false
}
