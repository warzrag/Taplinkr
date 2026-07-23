import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { linkId, multiLinkId } = await request.json()
    
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    // Obtenir les informations du visiteur
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
              request.headers.get('x-real-ip') || 
              'unknown'
    const userAgent = request.headers.get('user-agent') || 'Unknown'
    const referer = request.headers.get('referer') || 'direct'
    
    // Récupérer le lien pour avoir l'userId
    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { userId: true, isActive: true }
    })
    
    if (!link || !link.isActive) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const ipAddress = ip.toString().split(',')[0].trim().slice(0, 64)
    const recentClicks = await prisma.click.count({
      where: { linkId, ip: ipAddress, createdAt: { gte: new Date(Date.now() - 60_000) } }
    })
    if (recentClicks >= 10) return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })

    if (multiLinkId) {
      const child = await prisma.multiLink.findFirst({ where: { id: multiLinkId, parentLinkId: linkId } })
      if (!child) return NextResponse.json({ error: 'Sous-lien invalide' }, { status: 400 })
    }

    // Créer l'entrée dans la table Click
    await prisma.click.create({
      data: {
        linkId,
        userId: link.userId,
        country: 'Unknown', // On pourrait utiliser geo-service ici
        device: userAgent.includes('Mobile') ? 'mobile' : 'desktop',
        referer,
        userAgent,
        ip: ipAddress
      }
    })

    // Si c'est un multilink, incrémenter son compteur
    if (multiLinkId) {
      await prisma.multiLink.update({
        where: { id: multiLinkId },
        data: { clicks: { increment: 1 } }
      })
    }

    // Incrémenter le compteur du lien principal
    await prisma.link.update({
      where: { id: linkId },
      data: { clicks: { increment: 1 } }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking click:', error)
    return NextResponse.json({ error: 'Failed to track click' }, { status: 500 })
  }
}
