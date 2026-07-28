import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { normalizeTeamInvitationStatus } from '@/lib/team-invitations'
import bcrypt from 'bcryptjs'

// POST /api/teams/join/[token] - Accepter une invitation et créer un compte
export async function POST(request: NextRequest, props: { params: Promise<{ token: string }> }) {
  const params = await props.params;
  try {
    const { token } = params
    const body = await request.json()
    const { name, password } = body

    if (!token) {
      return NextResponse.json({ error: 'Token is missing' }, { status: 400 })
    }

    if (!name || !password) {
      return NextResponse.json({ error: 'Name and password are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long' }, { status: 400 })
    }

    // Rechercher l'invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invalid invitation' }, { status: 404 })
    }

    // Vérifier le statut et l'expiration
    if (normalizeTeamInvitationStatus(invitation.status) !== 'pending') {
      return NextResponse.json({ error: 'This invitation has already been used' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'This invitation has expired' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    if (existingUser) {
      return NextResponse.json({ 
        error: 'An account already exists with this email. Please log in.'
      }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Générer un username unique basé sur l'email
    const baseUsername = invitation.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let counter = 1
    
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`
      counter++
    }

    // Créer le compte et l'ajouter à l'équipe dans une transaction
    const result = await prisma.$transaction(async (tx) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          email: invitation.email,
          name,
          username,
          password: hashedPassword,
          emailVerified: true, // Email vérifié automatiquement via invitation
          teamId: invitation.teamId,
          teamRole: invitation.role,
          // Plan gratuit par défaut
          plan: 'free'
        }
      })

      // Mettre à jour l'invitation
      await tx.teamInvitation.update({
        where: { id: invitation.id },
        data: {
          status: 'accepted',
          acceptedAt: new Date()
        }
      })

      // Créer le profil utilisateur
      await tx.userProfile.create({
        data: {
          userId: user.id
        }
      })
      
      // Mettre à jour les infos du user avec bio et thème
      await tx.user.update({
        where: { id: user.id },
        data: {
          bio: `Member of the ${invitation.team.name} team`,
          theme: 'gradient',
          primaryColor: '#3b82f6',
          secondaryColor: '#8b5cf6'
        }
      })

      return user
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account created and team joined successfully',
      user: {
        id: result.id,
        email: result.email,
        name: result.name,
        username: result.username,
        teamRole: result.teamRole
      }
    })
  } catch (error) {
    console.error('Erreur acceptation invitation:', error)
    return NextResponse.json(
      { error: 'Unable to create the account' },
      { status: 500 }
    )
  }
}
