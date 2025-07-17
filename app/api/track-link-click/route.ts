import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId } = body

    if (!linkId) {
      return NextResponse.json({ error: 'linkId requis' }, { status: 400 })
    }

    // Mettre à jour le lien et récupérer le nouveau nombre de clics
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        clicks: {
          increment: 1
        }
      },
      select: {
        id: true,
        clicks: true
      }
    })

    // Enregistrer le clic dans la table Click pour les analytics détaillés
    try {
      await prisma.click.create({
        data: {
          linkId: linkId,
          country: request.headers.get('x-vercel-ip-country') || 'Unknown',
          device: request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop',
          referrer: request.headers.get('referer') || 'direct'
        }
      })
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du clic détaillé:', error)
      // On continue même si l'enregistrement détaillé échoue
    }

    return NextResponse.json({ 
      success: true,
      linkId: updatedLink.id,
      clicks: updatedLink.clicks
    })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}