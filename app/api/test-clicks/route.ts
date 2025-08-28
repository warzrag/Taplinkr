import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const userId = session.user.id
    
    // Récupérer tous les liens avec leurs clics
    const links = await prisma.link.findMany({
      where: { userId },
      select: { 
        id: true, 
        title: true, 
        slug: true,
        clicks: true,
        views: true 
      }
    })
    
    // Calculer le total
    const totalClicks = links.reduce((sum, link) => sum + (link.clicks || 0), 0)
    const totalViews = links.reduce((sum, link) => sum + (link.views || 0), 0)
    
    // Compter aussi dans la table Click
    const clickTableCount = await prisma.click.count({
      where: { userId }
    })
    
    return NextResponse.json({
      userId,
      totalLinks: links.length,
      totalClicks,
      totalViews,
      clickTableCount,
      links: links.map(l => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        clicks: l.clicks,
        views: l.views
      }))
    })
  } catch (error) {
    console.error('Erreur test clicks:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}