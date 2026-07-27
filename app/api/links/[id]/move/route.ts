import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { hasTeamActionPermission, TeamAction } from '@/lib/team-roles'

// PUT - Déplacer un lien vers un dossier
export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { folderId } = body

    // Vérifier que le lien appartient à l'utilisateur
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true, teamRole: true },
    })
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existingLink = await prisma.link.findUnique({
      where: { id: params.id },
    })
    const canMoveLink = existingLink && (
      existingLink.userId === currentUser.id
      || (
        currentUser.teamId
        && existingLink.teamId === currentUser.teamId
        && hasTeamActionPermission(currentUser.teamRole, TeamAction.EDIT_LINK)
      )
    )

    if (!canMoveLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // Si folderId est fourni, vérifier que le dossier appartient à l'utilisateur
    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: currentUser.teamId
          ? {
              id: folderId,
              OR: [
                { userId: currentUser.id },
                { teamId: currentUser.teamId, teamShared: true },
              ],
            }
          : { id: folderId, userId: currentUser.id },
      })

      if (!folder) {
        return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
      }
    }

    // Mettre à jour le lien
    const link = await prisma.link.update({
      where: { id: params.id },
      data: { folderId: folderId || null },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        },
        folder: true
      }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors du déplacement du lien:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
