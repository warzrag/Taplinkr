import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { cache } from '@/lib/redis-cache'

// PUT - Mettre à jour un dossier
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, color, icon, isExpanded } = body

    // Vérifier que le dossier appartient à l'utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: { 
        id: params.id, 
        user: { email: session.user.email } 
      }
    })

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    const folder = await prisma.folder.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(color !== undefined && { color }),
        ...(icon !== undefined && { icon }),
        ...(isExpanded !== undefined && { isExpanded })
      },
      include: {
        links: {
          include: {
            multiLinks: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    // 🔥 Pas besoin d'invalider cache Redis (désactivé)
    // Le cache localStorage sera invalidé côté client

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}

// DELETE - Supprimer un dossier
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Vérifier que le dossier appartient à l'utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: { 
        id: params.id, 
        user: { email: session.user.email } 
      }
    })

    if (!existingFolder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Déplacer tous les liens du dossier vers "sans dossier" (folderId = null)
    const descendantIds: string[] = []
    let pendingParentIds = [params.id]
    while (pendingParentIds.length) {
      const children = await prisma.folder.findMany({
        where: { parentId: { in: pendingParentIds }, userId: existingFolder.userId },
        select: { id: true },
      })
      const childIds = children.map(child => child.id)
      descendantIds.push(...childIds)
      pendingParentIds = childIds
    }

    // Deleting a client or category never deletes its links or click history.
    await prisma.link.updateMany({
      where: { folderId: { in: [params.id, ...descendantIds] } },
      data: { folderId: null }
    })

    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: params.id }
    })

    // 🔥 Pas besoin d'invalider cache Redis (désactivé)
    // Le cache localStorage sera invalidé côté client

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du dossier:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
