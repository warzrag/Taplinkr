import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // 1. Récupérer tous les liens visibles (via la route temp-fix)
    const tempFixResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/links-temp-fix`, {
      headers: {
        cookie: `next-auth.session-token=${session.sessionToken || ''}`
      }
    })
    
    let visibleLinks = []
    if (tempFixResponse.ok) {
      visibleLinks = await tempFixResponse.json()
    }

    // 2. Pour chaque lien visible, vérifier les stats
    const linkStats = await Promise.all(
      visibleLinks.map(async (link: any) => {
        // Compter les clics dans la table Click pour ce lien
        const clicksInTable = await prisma.click.count({
          where: { linkId: link.id }
        })
        
        // Récupérer le userId de ce lien
        const linkDetails = await prisma.link.findUnique({
          where: { id: link.id },
          select: {
            userId: true,
            clicks: true,
            views: true
          }
        })
        
        return {
          linkId: link.id,
          title: link.title,
          userId: linkDetails?.userId,
          clicksInLinkColumn: link.clicks || 0,
          viewsInLinkColumn: link.views || 0,
          clicksInClickTable: clicksInTable,
          isOwnedByCurrentUser: linkDetails?.userId === session.user.id
        }
      })
    )

    // 3. Compter les clics totaux par userId
    const userIds = [...new Set(linkStats.map(l => l.userId).filter(Boolean))]
    const clicksByUser = await Promise.all(
      userIds.map(async (userId) => {
        const totalClicks = await prisma.click.count({
          where: { userId: userId as string }
        })
        return {
          userId,
          totalClicksInTable: totalClicks,
          isCurrentUser: userId === session.user.id
        }
      })
    )

    return NextResponse.json({
      currentUserId: session.user.id,
      visibleLinksCount: visibleLinks.length,
      linkStats,
      clicksByUser,
      summary: {
        totalClicksAcrossAllLinks: linkStats.reduce((sum, l) => sum + l.clicksInLinkColumn, 0),
        totalViewsAcrossAllLinks: linkStats.reduce((sum, l) => sum + l.viewsInLinkColumn, 0),
        totalClicksInClickTable: linkStats.reduce((sum, l) => sum + l.clicksInClickTable, 0),
        linksOwnedByCurrentUser: linkStats.filter(l => l.isOwnedByCurrentUser).length,
        linksOwnedByOtherUsers: linkStats.filter(l => !l.isOwnedByCurrentUser).length
      }
    })

  } catch (error) {
    console.error('Erreur check clicks:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 })
  }
}