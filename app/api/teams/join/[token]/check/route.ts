import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/teams/join/[token]/check - Vérifier une invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // Rechercher l'invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: {
          select: {
            name: true,
            description: true
          }
        },
        invitedBy: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation invalide ou expirée' }, { status: 404 })
    }

    // Vérifier le statut
    if (invitation.status !== 'pending') {
      return NextResponse.json({ 
        error: invitation.status === 'accepted' 
          ? 'Cette invitation a déjà été acceptée' 
          : 'Cette invitation n\'est plus valide'
      }, { status: 400 })
    }

    // Vérifier l'expiration
    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 })
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: invitation.email }
    })

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        team: invitation.team,
        invitedBy: invitation.invitedBy,
        userExists: !!existingUser,
        isAlreadyMember: existingUser ? existingUser.teamId === invitation.teamId : false
      }
    })
  } catch (error) {
    console.error('Erreur vérification invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la vérification' },
      { status: 500 }
    )
  }
}