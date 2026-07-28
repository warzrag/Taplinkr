import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'

// POST - Partager un dossier avec l'équipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { folderId } = await request.json()

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }

    // Récupérer l'utilisateur et son équipe
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true }
    })

    if (!user?.teamId) {
      return NextResponse.json({ error: 'You are not a member of a team' }, { status: 400 })
    }

    // Vérifier que le dossier appartient à l'utilisateur
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        userId: user.id
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Partager le dossier avec l'équipe
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        teamShared: true,
        teamId: user.teamId,
        originalOwnerId: folder.originalOwnerId || user.id
      }
    })

    // 🔥 Pas besoin d'invalider cache Redis (désactivé)
    // Le cache localStorage sera invalidé côté client

    return NextResponse.json({
      message: 'Folder shared successfully',
      folder: updatedFolder
    })
  } catch (error) {
    console.error('Erreur partage dossier:', error)
    return NextResponse.json({ error: 'Unable to share the folder' }, { status: 500 })
  }
}

// DELETE - Retirer un dossier du partage équipe
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true }
    })

    // Vérifier que le dossier est partagé et que l'utilisateur est le propriétaire
    const folder = await prisma.folder.findFirst({
      where: {
        id: folderId,
        teamShared: true,
        OR: [
          { userId: user!.id },
          { originalOwnerId: user!.id }
        ]
      }
    })

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found or access denied' }, { status: 404 })
    }

    // Retirer le dossier du partage
    const updatedFolder = await prisma.folder.update({
      where: { id: folderId },
      data: {
        teamShared: false,
        teamId: null
      }
    })

    // 🔥 Pas besoin d'invalider cache Redis (désactivé)
    // Le cache localStorage sera invalidé côté client

    return NextResponse.json({
      message: 'Folder sharing removed',
      folder: updatedFolder
    })
  } catch (error) {
    console.error('Erreur retrait partage dossier:', error)
    return NextResponse.json({ error: 'Unable to remove folder sharing' }, { status: 500 })
  }
}
