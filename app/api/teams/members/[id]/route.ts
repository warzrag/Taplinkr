import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/members/[id] - Retirer un membre de l'équipe
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
    if (!user?.teamId) {
      return NextResponse.json({ error: 'Vous n’êtes pas membre d’une équipe' }, { status: 403 })
    }
    const team = await prisma.team.findUnique({ where: { id: user.teamId } })
    const isOwner = team?.ownerId === session.user.id
    const isAdmin = user.teamRole === 'admin'
    if (!team || (!isOwner && !isAdmin)) {
      return NextResponse.json({ error: 'Permission refusée' }, { status: 403 })
    }

    // Vérifier que le membre appartient bien à l'équipe
    const member = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!member || member.teamId !== team.id) {
      return NextResponse.json({ error: 'Membre non trouvé dans votre équipe' }, { status: 404 })
    }

    if (member.id === team.ownerId) {
      return NextResponse.json({ error: 'Le propriétaire ne peut pas être retiré' }, { status: 400 })
    }
    if (isAdmin && member.teamRole === 'admin') {
      return NextResponse.json({ error: 'Seul le propriétaire peut retirer un administrateur' }, { status: 403 })
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
