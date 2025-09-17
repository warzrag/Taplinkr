import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/members/[id] - Retirer un membre de l'équipe
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

    // Vérifier que le membre appartient bien à l'équipe
    const member = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!member || member.teamId !== user.ownedTeam.id) {
      return NextResponse.json({ error: 'Membre non trouvé dans votre équipe' }, { status: 404 })
    }

    // Empêcher le propriétaire de se retirer lui-même
    if (member.id === user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas vous retirer de votre propre équipe' }, { status: 400 })
    }

    // Retirer le membre de l'équipe et invalider ses sessions
    await prisma.user.update({
      where: { id: params.id },
      data: {
        teamId: null,
        teamRole: null,
        sessionVersion: { increment: 1 } // Déconnexion automatique
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors du retrait du membre:', error)
    return NextResponse.json(
      { error: 'Erreur lors du retrait du membre' },
      { status: 500 }
    )
  }
}