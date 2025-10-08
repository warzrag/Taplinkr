import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { cache } from '@/lib/redis-cache'

// PUT - Mettre à jour un dossier
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
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
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
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

    // ⚡ Invalider le cache après modification
    const cacheKey = `folders:user:${existingFolder.userId}`
    await cache.del(cacheKey)

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// DELETE - Supprimer un dossier
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que le dossier appartient à l'utilisateur
    const existingFolder = await prisma.folder.findFirst({
      where: { 
        id: params.id, 
        user: { email: session.user.email } 
      }
    })

    if (!existingFolder) {
      return NextResponse.json({ error: 'Dossier non trouvé' }, { status: 404 })
    }

    // Déplacer tous les liens du dossier vers "sans dossier" (folderId = null)
    await prisma.link.updateMany({
      where: { folderId: params.id },
      data: { folderId: null }
    })

    // Supprimer le dossier
    await prisma.folder.delete({
      where: { id: params.id }
    })

    // ⚡ Invalider le cache après suppression
    const cacheKey = `folders:user:${existingFolder.userId}`
    await cache.del(cacheKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression du dossier:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}