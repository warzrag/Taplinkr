import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST /api/teams/join/[token]/accept - Accepter une invitation (utilisateur existant)
export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { token } = params

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // Rechercher l'invitation
    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation invalide' }, { status: 404 })
    }

    // Vérifier que l'email correspond
    if (invitation.email !== session.user.email) {
      return NextResponse.json({ 
        error: 'Cette invitation n\'est pas pour votre compte' 
      }, { status: 403 })
    }

    // Vérifier le statut et l'expiration
    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Cette invitation a déjà été utilisée' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Cette invitation a expiré' }, { status: 400 })
    }

    // Vérifier que l'utilisateur n'est pas déjà dans une équipe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    if (user.teamId) {
      if (user.teamId === invitation.teamId) {
        return NextResponse.json({ 
          error: 'Vous êtes déjà membre de cette équipe' 
        }, { status: 400 })
      } else {
        return NextResponse.json({ 
          error: 'Vous êtes déjà membre d\'une autre équipe' 
        }, { status: 400 })
      }
    }

    // Rejoindre l'équipe dans une transaction
    await prisma.$transaction(async (tx) => {
      // Mettre à jour l'utilisateur
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          teamId: invitation.teamId,
          teamRole: invitation.role
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
    })

    return NextResponse.json({ 
      success: true,
      message: 'Équipe rejointe avec succès',
      teamId: invitation.teamId
    })
  } catch (error) {
    console.error('Erreur acceptation invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'acceptation de l\'invitation' },
      { status: 500 }
    )
  }
}