import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clickId, duration } = body

    if (!clickId || typeof duration !== 'number') {
      return NextResponse.json({ error: 'clickId et duration requis' }, { status: 400 })
    }

    // Mettre à jour la durée de visite pour ce clic
    await prisma.click.update({
      where: { id: clickId },
      data: { duration: Math.round(duration) } // Durée en secondes
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement de la durée:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}