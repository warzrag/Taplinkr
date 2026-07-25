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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true },
    })
    if (!user?.teamId) {
      return NextResponse.json({ error: 'You are not a member of a team' }, { status: 403 })
    }
    const team = await prisma.team.findUnique({ where: { id: user.teamId } })
    const isOwner = team?.ownerId === session.user.id
    const isAdmin = user.teamRole === 'admin'
    if (!team || (!isOwner && !isAdmin)) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }

    // Vérifier que le membre appartient bien à l'équipe
    const member = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!member || member.teamId !== team.id) {
      return NextResponse.json({ error: 'Member not found on your team' }, { status: 404 })
    }

    if (member.id === team.ownerId) {
      return NextResponse.json({ error: 'The owner cannot be removed' }, { status: 400 })
    }
    if (isAdmin && member.teamRole === 'admin') {
      return NextResponse.json({ error: 'Only the owner can remove an administrator' }, { status: 403 })
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
      { error: 'Unable to remove the member' },
      { status: 500 }
    )
  }
}
