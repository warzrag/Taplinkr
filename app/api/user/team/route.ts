import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        team: {
          include: {
            owner: {
              select: {
                id: true,
                name: true,
                email: true,
                plan: true,
                planExpiresAt: true
              }
            },
            members: {
              select: {
                id: true,
                name: true,
                email: true,
                teamRole: true
              }
            }
          }
        }
      }
    })

    if (!user?.team) {
      return NextResponse.json({ error: 'Pas d\'équipe' }, { status: 404 })
    }

    return NextResponse.json({
      team: user.team,
      teamOwner: user.team.owner,
      userRole: user.teamRole
    })
  } catch (error) {
    console.error('Erreur récupération équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des informations' },
      { status: 500 }
    )
  }
}