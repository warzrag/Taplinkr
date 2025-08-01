import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/teams/join/[token] - Récupérer les détails de l'invitation
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: {
          select: { id: true, name: true, description: true }
        },
        invitedBy: {
          select: { name: true, email: true }
        }
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Invitation expirée' }, { status: 400 })
    }

    return NextResponse.json({ invitation })
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération de l\'invitation' },
      { status: 500 }
    )
  }
}

// POST /api/teams/join/[token] - Accepter l'invitation
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

    const invitation = await prisma.teamInvitation.findUnique({
      where: { token },
      include: {
        team: true
      }
    })

    if (!invitation) {
      return NextResponse.json({ error: 'Invitation non trouvée' }, { status: 404 })
    }

    if (invitation.status !== 'pending') {
      return NextResponse.json({ error: 'Invitation déjà utilisée' }, { status: 400 })
    }

    if (new Date() > invitation.expiresAt) {
      return NextResponse.json({ error: 'Invitation expirée' }, { status: 400 })
    }

    // Vérifier que l'email correspond à l'utilisateur connecté
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.email !== invitation.email) {
      return NextResponse.json({ 
        error: 'Email incorrect',
        message: 'Cette invitation est destinée à un autre email' 
      }, { status: 400 })
    }

    // Vérifier que l'utilisateur n'est pas déjà dans une équipe
    if (user.teamId) {
      return NextResponse.json({ 
        error: 'Déjà dans une équipe',
        message: 'Vous devez quitter votre équipe actuelle avant de rejoindre une nouvelle équipe'
      }, { status: 400 })
    }

    // Transaction pour rejoindre l'équipe
    await prisma.$transaction(async (tx) => {
      // Mettre à jour l'utilisateur
      await tx.user.update({
        where: { id: session.user.id },
        data: {
          teamId: invitation.teamId,
          teamRole: invitation.role
        }
      })

      // Marquer l'invitation comme acceptée
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
      team: {
        id: invitation.team.id,
        name: invitation.team.name,
        role: invitation.role
      }
    })
  } catch (error) {
    console.error('Erreur lors de l\'acceptation de l\'invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'acceptation de l\'invitation' },
      { status: 500 }
    )
  }
}