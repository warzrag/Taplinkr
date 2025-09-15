import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'lolobkeikzed'
    
    // Chercher le lien avec tous les détails
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        },
        user: true
      }
    })
    
    if (!link) {
      return NextResponse.json({ error: 'Link not found' })
    }
    
    return NextResponse.json({
      slug: link.slug,
      title: link.title,
      isDirect: link.isDirect,
      directUrl: link.directUrl,
      multiLinksCount: link.multiLinks.length,
      multiLinks: link.multiLinks,
      userId: link.userId,
      userName: link.user.name
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error getting link details',
      details: error.message
    }, { status: 500 })
  }
}