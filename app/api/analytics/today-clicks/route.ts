import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Date de début d'aujourd'hui (00:00:00)
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    // Date de fin d'aujourd'hui (23:59:59)
    const endOfToday = new Date()
    endOfToday.setHours(23, 59, 59, 999)

    // Récupérer les liens personnels de l'utilisateur
    const userLinks = await prisma.link.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        internalName: true,
        clicks: true,
      },
      orderBy: {
        order: 'asc'
      }
    })

    // Récupérer les clics d'aujourd'hui pour chaque lien
    const clicksData = await Promise.all(
      userLinks.map(async (link) => {
        const todayClicks = await prisma.click.count({
          where: {
            linkId: link.id,
            timestamp: {
              gte: startOfToday,
              lte: endOfToday,
            },
          },
        })

        return {
          id: link.id,
          name: link.internalName || link.title,
          slug: link.slug,
          todayClicks,
          totalClicks: link.clicks || 0,
        }
      })
    )

    // Filtrer pour ne garder que les liens qui ont des clics aujourd'hui
    // OU garder tous les liens (tu peux choisir)
    const linksWithClicksToday = clicksData.filter(link => link.todayClicks > 0)

    return NextResponse.json({
      startOfToday: startOfToday.toISOString(),
      endOfToday: endOfToday.toISOString(),
      links: linksWithClicksToday.length > 0 ? linksWithClicksToday : clicksData.slice(0, 10), // Top 10 si aucun clic aujourd'hui
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des clics d\'aujourd\'hui:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
