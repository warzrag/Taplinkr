import { NextRequest, NextResponse } from 'next/server'

import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { getLocationFromIP } from '@/lib/geo-location-helper'
import { prisma } from '@/lib/prisma'
import { parseUserAgent } from '@/lib/user-agent-parser'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { multiLinkId, sessionId, screenResolution, language, timezone } = body

    if (typeof multiLinkId !== 'string' || !multiLinkId) {
      return NextResponse.json({ error: 'multiLinkId requis' }, { status: 400 })
    }

    const multiLink = await prisma.multiLink.findUnique({
      where: { id: multiLinkId },
      include: { parentLink: true },
    })
    if (!multiLink?.parentLink?.isActive) {
      return NextResponse.json({ error: 'MultiLink non trouvé' }, { status: 404 })
    }

    const assessment = await assessClickRequest({
      request,
      linkId: multiLink.parentLinkId,
      multiLinkId,
      sessionId: typeof sessionId === 'string' ? sessionId : null,
    })

    if (!assessment.counted) {
      await recordFilteredClick({
        linkId: multiLink.parentLinkId,
        userId: multiLink.parentLink.userId,
        multiLinkId,
        assessment,
      })
      return NextResponse.json({
        success: true,
        counted: false,
        reason: assessment.reason,
      })
    }

    const location = await getLocationFromIP(assessment.rawIp)
    const parsed = parseUserAgent(assessment.userAgent)

    await prisma.$transaction([
      prisma.click.create({
        data: {
          linkId: multiLink.parentLinkId,
          userId: multiLink.parentLink.userId,
          multiLinkId,
          sessionId: typeof sessionId === 'string' ? sessionId.slice(0, 128) : null,
          ip: assessment.visitorHash,
          userAgent: assessment.userAgent.slice(0, 512),
          referer: assessment.referer,
          device: parsed.device.type,
          browser: parsed.browser.name,
          os: parsed.os.name,
          screenResolution: String(screenResolution || '').slice(0, 32) || null,
          language: String(language || '').slice(0, 32) || null,
          timezone: String(timezone || '').slice(0, 64) || null,
          country: location.country,
          city: location.city || null,
          region: location.region || null,
          latitude: location.lat || null,
          longitude: location.lon || null,
        },
      }),
      prisma.multiLink.update({
        where: { id: multiLinkId },
        data: { clicks: { increment: 1 } },
      }),
    ])

    return NextResponse.json({ success: true, counted: true })
  } catch (error) {
    console.error('Erreur lors de l’enregistrement du clic MultiLink:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
