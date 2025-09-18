import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()

  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec son équipe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: {
          include: {
            members: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!user?.teamId) {
      return NextResponse.json({
        message: "Vous n'êtes pas dans une équipe",
        user: {
          id: user?.id,
          email: user?.email,
          teamId: null
        }
      })
    }

    // Récupérer TOUS les liens de l'équipe
    const allTeamLinks = await prisma.link.findMany({
      where: {
        teamId: user.teamId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Récupérer les liens partagés de l'équipe
    const sharedTeamLinks = await prisma.link.findMany({
      where: {
        teamId: user.teamId,
        teamShared: true
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Statistiques par utilisateur
    const linksByUser = allTeamLinks.reduce((acc, link) => {
      const userEmail = link.user.email || 'unknown'
      if (!acc[userEmail]) {
        acc[userEmail] = {
          total: 0,
          shared: 0,
          private: 0,
          userName: link.user.name || userEmail
        }
      }
      acc[userEmail].total++
      if (link.teamShared) {
        acc[userEmail].shared++
      } else {
        acc[userEmail].private++
      }
      return acc
    }, {} as Record<string, any>)

    return NextResponse.json({
      debug: true,
      currentUser: {
        id: user.id,
        email: user.email,
        name: user.name,
        teamId: user.teamId,
        teamRole: user.teamRole
      },
      team: {
        id: user.team?.id,
        name: user.team?.name,
        membersCount: user.team?.members.length,
        members: user.team?.members.map(m => ({
          userId: m.userId,
          role: m.role,
          email: m.user.email,
          name: m.user.name
        }))
      },
      links: {
        totalInTeam: allTeamLinks.length,
        totalShared: sharedTeamLinks.length,
        byUser: linksByUser,
        sharedLinks: sharedTeamLinks.map(l => ({
          id: l.id,
          title: l.title,
          owner: l.user.email,
          teamShared: l.teamShared,
          isActive: l.isActive
        }))
      },
      message: "Diagnostic des liens d'équipe"
    })
  } catch (error) {
    console.error('Erreur diagnostic équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors du diagnostic', details: error },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}