import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Récupérer le lien avec protection
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        directUrl: true,
        shieldEnabled: true,
        isUltraLink: true,
        shieldConfig: true,
        isActive: true
      }
    })
    
    if (!link || !link.isActive || !link.directUrl) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    // Vérifier que le lien a une protection activée
    if (!link.shieldEnabled && !link.isUltraLink) {
      return NextResponse.json({ error: 'No protection enabled' }, { status: 400 })
    }
    
    return NextResponse.json(link)
  } catch (error) {
    console.error('Error fetching shield link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}