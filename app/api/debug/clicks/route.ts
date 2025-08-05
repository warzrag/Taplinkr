import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer tous les clics de l'utilisateur
    const userLinks = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: { id: true }
    })

    const linkIds = userLinks.map(link => link.id)

    let clicks: any[] = []
    let totalClicks = 0

    // Gérer le cas où il n'y a pas de liens
    if (linkIds.length > 0) {
      clicks = await prisma.click.findMany({
        where: {
          linkId: { in: linkIds }
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          link: {
            select: {
              slug: true,
              title: true
            }
          }
        }
      })

      totalClicks = await prisma.click.count({
        where: {
          linkId: { in: linkIds }
        }
      })
    }

    // Vérifier aussi tous les clics sans filtre pour debug
    let allClicks = 0
    let multiLinks = 0
    
    try {
      allClicks = await prisma.click.count()
    } catch (e) {
      console.log('Erreur count all clicks:', e)
    }
    
    try {
      // Vérifier s'il y a des MultiLinks seulement si on a des linkIds
      if (linkIds.length > 0) {
        multiLinks = await prisma.multiLink.count({
          where: {
            linkId: { in: linkIds }
          }
        })
      }
    } catch (e) {
      console.log('Erreur count multiLinks:', e)
    }

    return NextResponse.json({
      success: true,
      userId: session.user.id,
      userEmail: session.user.email,
      linksCount: userLinks.length,
      linkIds,
      totalClicks,
      totalClicksInDatabase: allClicks,
      totalMultiLinks: multiLinks,
      recentClicks: clicks,
      message: totalClicks === 0 ? 'Aucun clic enregistré pour cet utilisateur' : `${totalClicks} clics trouvés`,
      debug: {
        sessionUserId: session.user.id,
        firstLinkId: linkIds[0] || null,
        clicksTableExists: true
      }
    })

  } catch (error) {
    console.error('Erreur debug clicks:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des clics', details: error },
      { status: 500 }
    )
  }
}