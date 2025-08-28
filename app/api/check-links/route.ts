import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // Récupérer TOUS les liens de l'utilisateur
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        multiLinks: true
      }
    })
    
    // Récupérer aussi TOUS les liens de la base (pour debug)
    const allLinks = await prisma.link.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        userId: true,
        clicks: true,
        views: true,
        isActive: true
      }
    })

    return NextResponse.json({
      userEmail: session.user.email,
      userId: session.user.id,
      userLinks: links.length,
      totalLinksInDb: allLinks.length,
      links: links.map(l => ({
        id: l.id,
        title: l.title,
        slug: l.slug,
        clicks: l.clicks,
        views: l.views,
        isActive: l.isActive,
        multiLinksCount: l.multiLinks.length
      })),
      allLinksPreview: allLinks.slice(0, 10) // Les 10 premiers liens de la base
    })
  } catch (error) {
    console.error('Erreur check-links:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}