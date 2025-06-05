import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { multiLinkId } = body

    if (!multiLinkId) {
      return NextResponse.json({ error: 'multiLinkId requis' }, { status: 400 })
    }

    // Vérifier que le MultiLink existe
    const multiLink = await prisma.multiLink.findUnique({
      where: { id: multiLinkId }
    })

    if (!multiLink) {
      return NextResponse.json({ error: 'MultiLink non trouvé' }, { status: 404 })
    }

    // Incrémenter le compteur de clics du MultiLink
    await prisma.multiLink.update({
      where: { id: multiLinkId },
      data: {
        clicks: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic MultiLink:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}