import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, checkLimit } from '@/lib/permissions'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/email'

// POST /api/teams/invite - Inviter un membre dans l'équipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'member', teamId } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Valider le rôle
    const validRoles = ['owner', 'admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    // Vérifier que l'utilisateur possède une équipe ou est admin de l'équipe
    let team
    if (teamId) {
      // Si teamId est fourni, vérifier que l'utilisateur a les droits
      team = await prisma.team.findFirst({
        where: {
          id: teamId,
          OR: [
            { ownerId: session.user.id },
            { members: { some: { id: session.user.id, teamRole: 'admin' } } }
          ]
        },
        include: {
          members: true,
          invitations: { where: { status: 'pending' } }
        }
      })
    } else {
      // Sinon, chercher l'équipe où l'utilisateur est propriétaire
      team = await prisma.team.findFirst({
        where: { ownerId: session.user.id },
        include: {
          members: true,
          invitations: { where: { status: 'pending' } }
        }
      })
    }

    if (!team) {
      return NextResponse.json({ error: 'Aucune équipe trouvée ou permissions insuffisantes' }, { status: 404 })
    }

    // Vérifier les limites d'équipe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const permissions = getUserPermissions(user)
    const currentMemberCount = team.members.length + team.invitations.length

    if (!checkLimit(permissions, 'maxTeamMembers', currentMemberCount)) {
      return NextResponse.json({ 
        error: 'Limite d\'équipe atteinte',
        message: `Votre plan permet maximum ${permissions.limits.maxTeamMembers} membres`
      }, { status: 403 })
    }

    // Vérifier si l'email n'est pas déjà invité ou membre
    const existingInvitation = await prisma.teamInvitation.findFirst({
      where: {
        teamId: team.id,
        email,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Une invitation est déjà en attente pour cet email' }, { status: 400 })
    }

    const existingMember = await prisma.user.findFirst({
      where: {
        email,
        teamId: team.id
      }
    })

    if (existingMember) {
      return NextResponse.json({ error: 'Cet utilisateur est déjà membre de l\'équipe' }, { status: 400 })
    }

    // Créer l'invitation
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7) // Expire dans 7 jours

    const invitation = await prisma.teamInvitation.create({
      data: {
        teamId: team.id,
        email,
        role,
        token,
        invitedById: session.user.id,
        expiresAt
      },
      include: {
        team: {
          select: { name: true }
        },
        invitedBy: {
          select: { name: true, email: true }
        }
      }
    })

    // Envoyer l'email d'invitation
    try {
      const inviteUrl = `${process.env.NEXTAUTH_URL}/teams/join/${token}`
      
      await sendEmail({
        to: email,
        subject: `Invitation à rejoindre l'équipe ${team.name} sur TapLinkr`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Invitation à rejoindre une équipe</h2>
            <p>Bonjour,</p>
            <p>${invitation.invitedBy.name || invitation.invitedBy.email} vous invite à rejoindre l'équipe <strong>${team.name}</strong> sur TapLinkr en tant que <strong>${getRoleLabel(role)}</strong>.</p>
            <p>Cliquez sur le lien ci-dessous pour accepter l'invitation :</p>
            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
              Rejoindre l'équipe
            </a>
            <p style="color: #666; font-size: 14px;">Cette invitation expire dans 7 jours.</p>
            <p style="color: #666; font-size: 14px;">Si vous ne pouvez pas cliquer sur le bouton, copiez ce lien : ${inviteUrl}</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Erreur envoi email:', emailError)
      // Continue même si l'email échoue
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

function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    owner: 'Propriétaire',
    admin: 'Administrateur',
    member: 'Membre',
    viewer: 'Observateur'
  }
  return labels[role] || role
}