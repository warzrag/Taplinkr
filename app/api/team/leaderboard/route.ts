import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET - Récupérer le leaderboard de l'équipe
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'all' // all, month, week

    // Récupérer l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, teamId: true, teamRole: true }
    })

    if (!user || !user.teamId) {
      return NextResponse.json({ error: 'Vous n\'êtes pas membre d\'une équipe' }, { status: 400 })
    }

    // Récupérer tous les membres de l'équipe
    const teamMembers = await prisma.user.findMany({
      where: {
        teamId: user.teamId
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        teamRole: true
      }
    })

    // Calculer la date de début selon la période
    let dateFilter: Date | undefined
    if (period === 'week') {
      dateFilter = new Date()
      dateFilter.setDate(dateFilter.getDate() - 7)
    } else if (period === 'month') {
      dateFilter = new Date()
      dateFilter.setMonth(dateFilter.getMonth() - 1)
    }

    // Pour chaque membre, calculer ses statistiques
    const leaderboard = await Promise.all(
      teamMembers.map(async (member) => {
        // Récupérer tous les liens assignés à ce membre
        const assignedLinks = await prisma.link.findMany({
          where: {
            assignedToUserId: member.id,
            teamShared: true,
            teamId: user.teamId,
            ...(dateFilter ? { updatedAt: { gte: dateFilter } } : {})
          },
          select: {
            id: true,
            title: true,
            clicks: true,
            views: true
          }
        })

        // Calculer les totaux
        const totalClicks = assignedLinks.reduce((sum, link) => sum + link.clicks, 0)
        const totalViews = assignedLinks.reduce((sum, link) => sum + link.views, 0)
        const totalLinks = assignedLinks.length

        // Calculer le taux de conversion
        const conversionRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0

        return {
          user: {
            id: member.id,
            name: member.name,
            email: member.email,
            image: member.image,
            teamRole: member.teamRole
          },
          stats: {
            totalClicks,
            totalViews,
            totalLinks,
            conversionRate: Number(conversionRate.toFixed(2))
          }
        }
      })
    )

    // Trier par nombre de clics DESC
    leaderboard.sort((a, b) => b.stats.totalClicks - a.stats.totalClicks)

    // Calculer les totaux de l'équipe
    const teamTotals = leaderboard.reduce(
      (acc, member) => ({
        totalClicks: acc.totalClicks + member.stats.totalClicks,
        totalViews: acc.totalViews + member.stats.totalViews,
        totalLinks: acc.totalLinks + member.stats.totalLinks
      }),
      { totalClicks: 0, totalViews: 0, totalLinks: 0 }
    )

    return NextResponse.json({
      leaderboard,
      teamTotals,
      period
    })
  } catch (error) {
    console.error('Erreur leaderboard:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
