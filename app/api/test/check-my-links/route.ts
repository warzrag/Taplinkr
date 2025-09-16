import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non authentifié' })
    }

    // Vérifier avec Prisma
    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        multiLinks: true
      }
    })

    // Vérifier spécifiquement les liens sans dossier
    const linksWithoutFolder = links.filter(link => !link.folderId)

    return NextResponse.json({
      userId: session.user.id,
      totalLinks: links.length,
      links: links.map(link => ({
        id: link.id,
        title: link.title,
        slug: link.slug,
        folderId: link.folderId,
        multiLinksCount: link.multiLinks.length
      })),
      linksWithoutFolder: linksWithoutFolder.length,
      linksInFolders: links.filter(link => link.folderId).length
    })

  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Erreur',
      details: error.message
    }, { status: 500 })
  }
}