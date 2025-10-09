import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// POST - Assigner un lien à un membre de l'équipe
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { linkId, assignedToUserId } = await request.json()

    if (!linkId) {
      return NextResponse.json({ error: 'ID du lien requis' }, { status: 400 })
    }

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true, teamRole: true }
    })

    if (!user || !user.teamId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas membre d\'une équipe' }, { status: 400 })
    }

    // Vérifier que l'utilisateur a les permissions (owner ou admin)
    if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
      return NextResponse.json({ error: 'Permissions insuffisantes' }, { status: 403 })
    }

    // Vérifier que le lien existe et appartient à l'équipe
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        teamShared: true,
        teamId: user.teamId
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé ou non partagé avec l\'équipe' }, { status: 404 })
    }

    // Si assignedToUserId est fourni, vérifier que le membre existe dans l'équipe
    if (assignedToUserId) {
      const assignedUser = await prisma.user.findFirst({
        where: {
          id: assignedToUserId,
          teamId: user.teamId
        }
      })

      if (!assignedUser) {
        return NextResponse.json({ error: 'Membre non trouvé dans l\'équipe' }, { status: 404 })
      }
    }

    // Assigner le lien
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        assignedToUserId: assignedToUserId || null
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json({
      message: assignedToUserId ? 'Lien assigné avec succès' : 'Assignation retirée',
      link: updatedLink
    })
  } catch (error) {
    console.error('Erreur assignation lien:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'assignation' }, { status: 500 })
  }
}

// GET - Récupérer les liens assignés à un membre
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get('memberId')

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true, teamRole: true }
    })

    if (!user || !user.teamId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas membre d\'une équipe' }, { status: 400 })
    }

    // Construire la requête
    const whereClause: any = {
      teamShared: true,
      teamId: user.teamId
    }

    // Si memberId fourni et que ce n'est pas le owner, filtrer uniquement ses liens
    if (memberId) {
      whereClause.assignedToUserId = memberId
    } else if (user.teamRole !== 'owner' && user.teamRole !== 'admin') {
      // Si membre simple, voir uniquement ses liens assignés
      whereClause.assignedToUserId = user.id
    }

    const links = await prisma.link.findMany({
      where: whereClause,
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    return NextResponse.json({ links })
  } catch (error) {
    console.error('Erreur récupération liens assignés:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
