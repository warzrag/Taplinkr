import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()
    if (typeof linkId !== 'string' || !linkId) {
      return NextResponse.json({ error: 'linkId requis' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, userId: true, isActive: true, isDirect: true },
    })
    if (!link?.isActive || !link.isDirect) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown')
      .trim()
      .slice(0, 64)
    const recentClicks = await prisma.click.count({
      where: { linkId, ip, createdAt: { gte: new Date(Date.now() - 60_000) } },
    })
    if (recentClicks >= 10) {
      return NextResponse.json({ error: 'Trop de requêtes' }, { status: 429 })
    }

    const userAgent = (request.headers.get('user-agent') || '').slice(0, 1000)
    const referer = (request.headers.get('referer') || 'direct').slice(0, 2000)
    const [, updatedLink] = await prisma.$transaction([
      prisma.click.create({
        data: {
          linkId,
          userId: link.userId,
          ip,
          userAgent,
          referer,
          country: request.headers.get('x-vercel-ip-country') || 'Unknown',
          device: /mobile/i.test(userAgent) ? 'mobile' : 'desktop',
        },
      }),
      prisma.link.update({
        where: { id: linkId },
        data: { clicks: { increment: 1 } },
        select: { id: true, clicks: true },
      }),
    ])

    return NextResponse.json({ success: true, linkId: updatedLink.id, clicks: updatedLink.clicks })
  } catch (error) {
    console.error('Erreur lors du suivi du clic:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
