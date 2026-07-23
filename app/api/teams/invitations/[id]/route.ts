import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/invitations/[id] - Annuler une invitation
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true },
    })

    // Vérifier que l'invitation appartient bien à l'équipe
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: params.id },
      include: { team: true },
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }
    const canManage = invitation.team.ownerId === session.user.id || (
      user?.teamId === invitation.teamId && user.teamRole === 'admin'
    )
    if (!canManage) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    // Supprimer l'invitation
    await prisma.teamInvitation.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'annulation de l\'invitation' },
      { status: 500 }
    )
  }
}
