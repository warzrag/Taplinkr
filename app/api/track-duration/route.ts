import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const { linkId, duration } = JSON.parse(body)
    
    if (!linkId || !duration) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Récupérer le dernier clic de ce lien dans les dernières 24h
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    
    const lastClick = await prisma.click.findFirst({
      where: {
        linkId,
        createdAt: {
          gte: oneDayAgo
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (lastClick) {
      // Mettre à jour la durée
      await prisma.click.update({
        where: { id: lastClick.id },
        data: { duration }
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking duration:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}