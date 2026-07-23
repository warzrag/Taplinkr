import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTeamAwareUserPermissions, checkTeamLimit } from '@/lib/team-permissions'
import { nanoid } from 'nanoid'
import {
  normalizeTeamInviteEmail,
  sendTeamInvitationEmail,
  type TeamInviteRole,
} from '@/lib/team-invitations'

// POST /api/teams/invite - Inviter un membre dans l'équipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email: rawEmail, role = 'member', teamId } = body

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }
    const email = normalizeTeamInviteEmail(rawEmail)

    // Valider le rôle
    const validRoles: TeamInviteRole[] = ['admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    const requester = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true },
    })
    const effectiveTeamId = teamId || requester?.teamId
    const team = effectiveTeamId
      ? await prisma.team.findUnique({
          where: { id: effectiveTeamId },
          include: {
            members: true,
            invitations: { where: { status: 'pending' } },
          },
        })
      : null

    const canInvite = team && (
      team.ownerId === session.user.id
      || (requester?.teamId === team.id && requester.teamRole === 'admin')
    )
    if (!team || !canInvite) {
      return NextResponse.json({ error: 'Seuls le propriétaire et les administrateurs peuvent inviter des membres' }, { status: 403 })
    }

    // Vérifier les limites d'équipe en tenant compte du plan du propriétaire
    const permissions = await getTeamAwareUserPermissions(session.user.id)
    const currentMemberCount = team.members.length + team.invitations.length

    if (!(await checkTeamLimit(session.user.id, 'maxTeamMembers', currentMemberCount))) {
      const { PLAN_LIMITS } = await import('@/lib/permissions')
      const maxMembers = PLAN_LIMITS[permissions.plan].maxTeamMembers
      return NextResponse.json({ 
        error: 'Limite d\'équipe atteinte',
        message: `Le plan de l'équipe permet maximum ${maxMembers} membres`
      }, { status: 403 })
    }

    // Vérifier si l'email n'est pas déjà invité ou membre
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId: team.id,
        email
      }
    })

    // Vérifier d'abord si l'utilisateur existe et est membre de l'équipe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.teamId === team.id) {
      return NextResponse.json({ error: 'Cet utilisateur est déjà membre de l\'équipe' }, { status: 400 })
    }
    if (existingUser?.teamId && existingUser.teamId !== team.id) {
      return NextResponse.json({ error: 'Cet utilisateur est déjà membre d’une autre équipe' }, { status: 400 })
    }

    if (existingInvitation) {
      // Si l'invitation est toujours en attente et non expirée
      if (existingInvitation.status === 'pending' && new Date(existingInvitation.expiresAt) > new Date()) {
        return NextResponse.json({ error: 'Une invitation est déjà en attente pour cet email' }, { status: 400 })
      }
      
      // Dans tous les autres cas (acceptée mais pas dans l'équipe, expirée, déclinée), supprimer l'ancienne invitation
      try {
        await prisma.teamInvitation.delete({
          where: { id: existingInvitation.id }
        })
      } catch (deleteError) {
        console.error('Erreur lors de la suppression de l\'ancienne invitation:', deleteError)
        return NextResponse.json({ 
          error: 'Impossible de créer une nouvelle invitation', 
          details: 'Une invitation existe déjà pour cet email' 
        }, { status: 400 })
      }
    }


    // Créer l'invitation
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

    // Créer l'invitation sans la relation user
    let invitation
    try {
      // D'abord créer l'invitation basique
      invitation = await prisma.teamInvitation.create({
        data: {
          teamId: team.id,
          email,
          role,
          token,
          invitedById: session.user.id,
          expiresAt
        }
      })
      
      // Puis récupérer avec les relations nécessaires
      invitation = await prisma.teamInvitation.findUnique({
        where: { id: invitation.id },
        include: {
          team: {
            select: { name: true }
          },
          invitedBy: {
            select: { name: true, email: true }
          }
        }
      })
    } catch (createError: any) {
      console.error('Erreur création invitation:', createError)
      // Si c'est une erreur de contrainte, essayer sans relations
      if (createError.code === 'P2003') {
        return NextResponse.json({ 
          error: 'L\'utilisateur invité doit d\'abord créer un compte sur TapLinkr',
          details: 'Demandez à la personne de s\'inscrire avec l\'email ' + email
        }, { status: 400 })
      }
      throw createError
    }

    // Envoyer l'email d'invitation
    try {
      const delivery = await sendTeamInvitationEmail({
        email,
        inviter: invitation.invitedBy.name || invitation.invitedBy.email,
        teamName: team.name,
        role,
        token,
      })
      if (!delivery.success) {
        return NextResponse.json({
          error: "L'invitation a été créée, mais l'email n'a pas pu être envoyé. Utilisez « Renvoyer ».",
          invitationCreated: true,
          invitationId: invitation.id,
        }, { status: 502 })
      }
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      return NextResponse.json({
        error: "L'invitation a été créée, mais l'email n'a pas pu être envoyé. Utilisez « Renvoyer ».",
        invitationCreated: true,
        invitationId: invitation.id,
      }, { status: 502 })
    }

    return NextResponse.json({ 
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        createdAt: invitation.createdAt,
        expiresAt: invitation.expiresAt
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'invitation', details: error instanceof Error ? error.message : 'Erreur inconnue' },
      { status: 500 }
    )
  }
}
