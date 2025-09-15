import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug') || 'lolobkeikzed'
    
    // Chercher le lien
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        title: true,
        isActive: true,
        userId: true,
        createdAt: true,
        updatedAt: true
      }
    })
    
    if (!link) {
      // Chercher tous les liens pour voir ce qui existe
      const allLinks = await prisma.link.findMany({
        select: {
          slug: true,
          title: true,
          isActive: true
        }
      })
      
      return NextResponse.json({
        error: 'Link not found',
        searchedSlug: slug,
        existingLinks: allLinks
      })
    }
    
    return NextResponse.json({
      success: true,
      link,
      message: link.isActive ? 'Link is active' : 'Link is NOT active'
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Error checking link',
      details: error.message
    }, { status: 500 })
  }
}