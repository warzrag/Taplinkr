import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    
    // Récupérer le lien par son slug
    const link = await prisma.link.findUnique({
      where: { slug },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })
    
    // Si le lien n'existe pas ou n'est pas actif
    if (!link || !link.isActive) {
      return NextResponse.redirect(new URL('/404', request.url))
    }
    
    // Enregistrer le clic
    try {
      await prisma.click.create({
        data: {
          linkId: link.id,
          country: request.headers.get('x-vercel-ip-country') || 'Unknown',
          device: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          referrer: request.headers.get('referer') || 'direct'
        }
      })
      
      // Incrémenter le compteur de clics
      await prisma.link.update({
        where: { id: link.id },
        data: { clicks: { increment: 1 } }
      })
    } catch (error) {
      console.error('Error tracking click:', error)
      // Continue même si le tracking échoue
    }
    
    // Si c'est un lien direct
    if (link.isDirect && link.directUrl) {
      // Rediriger directement vers l'URL cible
      return NextResponse.redirect(link.directUrl)
    }
    
    // Si c'est un lien avec un seul MultiLink, rediriger directement
    if (link.multiLinks.length === 1) {
      const singleLink = link.multiLinks[0]
      
      // Tracker le clic sur le MultiLink
      try {
        await prisma.multiLink.update({
          where: { id: singleLink.id },
          data: { clicks: { increment: 1 } }
        })
      } catch (error) {
        console.error('Error tracking multilink click:', error)
      }
      
      return NextResponse.redirect(singleLink.url)
    }
    
    // Sinon, rediriger vers la page de preview avec tous les liens
    return NextResponse.redirect(new URL(`/link/${slug}`, request.url))
    
  } catch (error) {
    console.error('Error in redirect handler:', error)
    return NextResponse.redirect(new URL('/404', request.url))
  }
}