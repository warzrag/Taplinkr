import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTeamAwareUserPermissions, checkTeamLimit } from '@/lib/team-permissions'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/resend-email'

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
        email,
        status: 'pending'
      }
    })

    if (existingInvitation) {
      return NextResponse.json({ error: 'Une invitation est déjà en attente pour cet email' }, { status: 400 })
    }

    // Vérifier si un utilisateur avec cet email existe ET est déjà membre
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser && existingUser.teamId === team.id) {
      return NextResponse.json({ error: 'Cet utilisateur est déjà membre de l\'équipe' }, { status: 400 })
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
      const inviteUrl = `${process.env.NEXTAUTH_URL || 'https://www.taplinkr.com'}/teams/join/${token}`
      
      await sendEmail({
        to: email,
        subject: `Invitation à rejoindre l'équipe ${team.name} sur TapLinkr`,
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px;">
              <!-- Header -->
              <div style="text-align: center; padding: 20px 0; border-bottom: 2px solid #8b5cf6;">
                <h1 style="color: #8b5cf6; margin: 0;">TapLinkr</h1>
                <p style="color: #666; margin: 5px 0;">One tap, tout accessible</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px 0;">
                <h2 style="color: #333; margin-bottom: 20px;">Invitation à rejoindre une équipe</h2>
                
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                  Bonjour,
                </p>
                
                <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
                  <strong>${invitation.invitedBy.name || invitation.invitedBy.email}</strong> vous invite à rejoindre l'équipe 
                  <strong style="color: #8b5cf6;">${team.name}</strong> sur TapLinkr en tant que 
                  <strong>${getRoleLabel(role)}</strong>.
                </p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #8b5cf6; padding: 15px; margin: 20px 0;">
                  <p style="margin: 0; color: #555;">
                    <strong>⚠️ Important :</strong> Si vous n'avez pas encore de compte TapLinkr, vous devrez d'abord en créer un avec l'adresse email <strong>${email}</strong>
                  </p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${inviteUrl}" 
                     style="display: inline-block; 
                            padding: 14px 30px; 
                            background-color: #8b5cf6; 
                            color: white; 
                            text-decoration: none; 
                            border-radius: 8px; 
                            font-weight: bold;
                            font-size: 16px;">
                    Accepter l'invitation
                  </a>
                </div>
                
                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 20px;">
                  Cette invitation expire dans 7 jours
                </p>
                
                <div style="border-top: 1px solid #eee; margin-top: 30px; padding-top: 20px;">
                  <p style="color: #999; font-size: 12px; text-align: center;">
                    Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br>
                    <a href="${inviteUrl}" style="color: #8b5cf6; word-break: break-all;">${inviteUrl}</a>
                  </p>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding: 20px 0; border-top: 1px solid #eee; margin-top: 30px;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2024 TapLinkr. Tous droits réservés.
                </p>
              </div>
            </div>
          </body>
          </html>
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