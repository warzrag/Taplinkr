import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  sendTeamInvitationEmail,
  type TeamInviteRole,
} from '@/lib/team-invitations'

export async function POST(_request: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await props.params
    const invitation = await prisma.teamInvitation.findUnique({
      where: { id },
      include: {
        team: true,
      },
    })
    if (!invitation) {
      return NextResponse.json({ error: 'Invitation not found' }, { status: 404 })
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, email: true, teamId: true, teamRole: true },
    })
    const canManage = invitation.team.ownerId === session.user.id || (
      requester?.teamId === invitation.teamId && requester.teamRole === 'admin'
    )
    if (!requester || !canManage) {
      return NextResponse.json({ error: 'Permission denied' }, { status: 403 })
    }
    if (invitation.status === 'accepted') {
      return NextResponse.json({ error: 'This invitation has already been accepted' }, { status: 400 })
    }
    if (!['admin', 'member', 'viewer'].includes(invitation.role)) {
      return NextResponse.json({ error: 'This invitation has an invalid role' }, { status: 400 })
    }

    const token = nanoid(32)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.teamInvitation.update({
      where: { id: invitation.id },
      data: {
        token,
        expiresAt,
        status: 'pending',
        acceptedAt: null,
      },
    })

    const delivery = await sendTeamInvitationEmail({
      email: invitation.email,
      inviter: requester.name || requester.email,
      teamName: invitation.team.name,
      role: invitation.role as TeamInviteRole,
      token,
    })
    if (!delivery.success) {
      return NextResponse.json({
        error: 'A new link was created, but the email could not be sent.',
      }, { status: 502 })
    }

    return NextResponse.json({
      success: true,
      expiresAt,
    })
  } catch (error) {
    console.error("Erreur lors du renvoi de l'invitation:", error)
    return NextResponse.json({ error: 'Unable to resend the invitation' }, { status: 500 })
  }
}
