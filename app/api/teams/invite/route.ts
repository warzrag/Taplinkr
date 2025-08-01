import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, checkLimit } from '@/lib/permissions'
import { nanoid } from 'nanoid'

// POST /api/teams/invite - Inviter un membre dans l'équipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'member' } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Valider le rôle
    const validRoles = ['owner', 'admin', 'member', 'viewer']
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rôle invalide' }, { status: 400 })
    }

    // Vérifier que l'utilisateur possède une équipe
    const team = await prisma.team.findFirst({
      where: { ownerId: session.user.id },
      include: {
        members: true,
        invitations: { where: { status: 'pending' } }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Aucune équipe trouvée' }, { status: 404 })
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
        message: `Votre plan permet maximum ${permissions.plan === 'premium' ? '10' : '5'} membres`
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

    // TODO: Envoyer l'email d'invitation
    console.log(`Invitation à rejoindre l'équipe \"${team.name}\" envoyée à ${email}`)
    console.log(`Lien d'invitation: ${process.env.NEXTAUTH_URL}/teams/join/${token}`)

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
      { error: 'Erreur lors de l\'invitation' },
      { status: 500 }
    )
  }
}