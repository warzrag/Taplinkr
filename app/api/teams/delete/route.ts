import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// DELETE /api/teams/delete - Supprimer l'équipe (propriétaire uniquement)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que l'utilisateur possède une équipe
    const team = await prisma.team.findFirst({
      where: { ownerId: session.user.id },
      include: {
        members: true,
        invitations: true
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Aucune équipe trouvée' }, { status: 404 })
    }

    // Retirer tous les membres de l'équipe (sauf le propriétaire)
    await prisma.user.updateMany({
      where: {
        teamId: team.id,
        id: { not: session.user.id }
      },
      data: {
        teamId: null,
        teamRole: null
      }
    })

    // Supprimer toutes les invitations
    await prisma.teamInvitation.deleteMany({
      where: { teamId: team.id }
    })

    // Supprimer les analytics de l'équipe
    await prisma.teamAnalytics.deleteMany({
      where: { teamId: team.id }
    })

    // Supprimer les templates de l'équipe
    await prisma.teamTemplate.deleteMany({
      where: { teamId: team.id }
    })

    // Supprimer l'équipe
    await prisma.team.delete({
      where: { id: team.id }
    })

    return NextResponse.json({ 
      message: 'Équipe supprimée avec succès',
      deletedTeam: team.name 
    })
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la suppression de l\'équipe' },
      { status: 500 }
    )
  }
}