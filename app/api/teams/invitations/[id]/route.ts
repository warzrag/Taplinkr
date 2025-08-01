import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/invitations/[id] - Annuler une invitation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur est propriétaire de l'équipe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { ownedTeam: true }
    })

    if (!user?.ownedTeam) {
      return NextResponse.json({ error: 'Vous n\'êtes pas propriétaire d\'une équipe' }, { status: 403 })
    }

    // Vérifier que l'invitation appartient bien à l'équipe
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id: params.id }
    })

    if (!invitation || invitation.teamId !== user.ownedTeam.id) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
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