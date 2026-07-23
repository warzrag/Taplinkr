import { NextRequest, NextResponse } from 'next/server'

import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { linkId } = await request.json()
    if (typeof linkId !== 'string' || !linkId) {
      return NextResponse.json({ error: 'ID du lien requis' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, userId: true, isActive: true },
    })
    if (!link?.isActive) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    const assessment = await assessClickRequest({ request, linkId })
    if (!assessment.counted) {
      await recordFilteredClick({ linkId, userId: link.userId, assessment })
      return NextResponse.json({ success: true, counted: false, reason: assessment.reason })
    }

    const [click] = await prisma.$transaction([
      prisma.click.create({
        data: {
          linkId,
          userId: link.userId,
          ip: assessment.visitorHash,
          userAgent: assessment.userAgent,
          referer: assessment.referer,
          country: request.headers.get('x-vercel-ip-country') || 'Unknown',
          device: /mobile/i.test(assessment.userAgent) ? 'mobile' : 'desktop',
        },
      }),
      prisma.link.update({
        where: { id: linkId },
        data: { clicks: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ success: true, counted: true, clickId: click.id })
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du clic:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
