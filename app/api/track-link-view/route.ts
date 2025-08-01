import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyticsService } from '@/lib/analytics-service'

export async function POST(request: NextRequest) {
  try {
    const { linkId, referrer, userAgent } = await request.json()
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Récupérer l'IP du visiteur
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    // Vérifier si le lien existe et récupérer l'userId
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { 
        id: true, 
        userId: true,
        views: true,
        isDirect: true
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    // On ne compte les vues que pour les pages multi-liens (pas pour les liens directs)
    if (link.isDirect) {
      return NextResponse.json({ 
        success: true, 
        message: 'View tracking skipped for direct link',
        views: link.views 
      })
    }

    // Utiliser un cookie de session pour éviter les vues multiples
    const sessionCookie = request.cookies.get(`viewed_${linkId}`)
    
    if (sessionCookie) {
      // La vue a déjà été comptée pour cette session
      return NextResponse.json({ 
        success: true, 
        message: 'View already counted',
        views: link.views 
      })
    }

    // Incrémenter le compteur de vues
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: { views: { increment: 1 } },
      select: { views: true }
    })

    // Enregistrer l'événement dans le service analytics
    await analyticsService.trackEvent({
      linkId,
      userId: link.userId,
      eventType: 'view',
      request: {
        ip,
        referer: referrer,
        userAgent,
        url: request.url
      }
    })

    // Créer la réponse avec le cookie de session
    const response = NextResponse.json({ 
      success: true,
      views: updatedLink.views 
    })

    // Définir un cookie qui expire dans 24 heures pour éviter les vues multiples
    response.cookies.set(`viewed_${linkId}`, '1', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 86400 // 24 heures
    })

    return response

  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Endpoint GET pour récupérer le nombre de vues
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { views: true, clicks: true }
    })

    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      views: link.views,
      clicks: link.clicks
    })
    
  } catch (error) {
    console.error('Error fetching views:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}