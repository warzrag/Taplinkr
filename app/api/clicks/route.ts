import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getClientIP } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId } = body

    if (!linkId) {
      return NextResponse.json({ error: 'ID du lien requis' }, { status: 400 })
    }

    // Vérifier que le lien existe
    const link = await prisma.link.findUnique({
      where: { id: linkId }
    })

    if (!link || !link.isActive) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Récupérer les informations de la requête
    const ip = getClientIP(request)
    const userAgent = request.headers.get('user-agent') || ''
    const referer = request.headers.get('referer') || ''
    const ipAddress = ip.toString().split(',')[0].trim().slice(0, 64)
    const recentClicks = await prisma.click.count({
      where: { linkId, ip: ipAddress, createdAt: { gte: new Date(Date.now() - 60_000) } }
    })
    if (recentClicks >= 10) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

    // Détection simple du device
    const device = userAgent.toLowerCase().includes('mobile') ? 'mobile' : 
                  userAgent.toLowerCase().includes('tablet') ? 'tablet' : 'desktop'

    // Enregistrer le clic
    const click = await prisma.click.create({
      data: {
        linkId,
        userId: link.userId,
        ip: ipAddress,
        userAgent,
        referer,
        device
      }
    })

    // Incrémenter le compteur de clics sur le lien
    await prisma.link.update({
      where: { id: linkId },
      data: {
        clicks: {
          increment: 1
        }
      }
    })

    return NextResponse.json({ success: true, clickId: click.id })
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement du clic:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
