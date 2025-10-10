import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true }
    })

    if (!user?.teamId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas dans une équipe' }, { status: 403 })
    }

    // Seul le owner ou admin peut modifier les surnoms
    if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
      return NextResponse.json({ error: 'Seul le propriétaire ou un admin peut modifier les surnoms' }, { status: 403 })
    }

    const { memberId, nickname } = await request.json()

    if (!memberId) {
      return NextResponse.json({ error: 'ID du membre requis' }, { status: 400 })
    }

    // Vérifier que le membre appartient à la même équipe
    const member = await prisma.user.findFirst({
      where: {
        id: memberId,
        teamId: user.teamId
      }
    })

    if (!member) {
      return NextResponse.json({ error: 'Membre non trouvé' }, { status: 404 })
    }

    // Mettre à jour le surnom
    const updatedMember = await prisma.user.update({
      where: { id: memberId },
      data: { nickname: nickname?.trim() || null },
      select: {
        id: true,
        name: true,
        email: true,
        nickname: true,
        teamRole: true
      }
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du surnom:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
