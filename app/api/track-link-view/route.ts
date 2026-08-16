import { NextRequest, NextResponse } from 'next/server'

import { analyticsService } from '@/lib/analytics-service'
import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { buildClickMetadata } from '@/lib/click-metadata'
import { prisma } from '@/lib/prisma'

// Jeton anonyme depuis VenusBot (?vb=). Volontairement strict : on ne stocke
// qu'un identifiant court et opaque, jamais le pseudo ni l'identifiant du fan.
const FAN_TOKEN_PATTERN = /^[A-Za-z0-9_-]{1,32}$/
const sanitizeFanToken = (value: unknown): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return FAN_TOKEN_PATTERN.test(trimmed) ? trimmed : null
}

export async function POST(request: NextRequest) {
  try {
    const { linkId, screenResolution, language, timezone, fanToken } = await request.json()
    if (typeof linkId !== 'string' || !linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }
    const safeFanToken = sanitizeFanToken(fanToken)

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, userId: true, folderId: true, views: true, isDirect: true, isActive: true },
    })
    if (!link?.isActive) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    if (link.isDirect) {
      return NextResponse.json({
        success: true,
        counted: false,
        reason: 'direct_link_tracked_on_redirect',
        views: link.views,
      })
    }

    const assessment = await assessClickRequest({ request, linkId })
    if (!assessment.counted) {
      await recordFilteredClick({ linkId, userId: link.userId, assessment })
      return NextResponse.json({ success: true, counted: false, reason: assessment.reason })
    }

    const clickMetadata = await buildClickMetadata({
      assessment,
      headers: request.headers,
      client: { screenResolution, language, timezone },
    })
    const [updatedLink, clickRecord] = await prisma.$transaction([
      prisma.link.update({
        where: { id: linkId },
        data: {
          views: { increment: 1 },
          clicks: { increment: 1 },
        },
        select: { views: true, clicks: true },
      }),
      prisma.click.create({
        data: {
          linkId,
          userId: link.userId,
          folderIdAtClick: link.folderId,
          fanToken: safeFanToken,
          ...clickMetadata,
        },
      }),
    ])

    await analyticsService.trackEvent({
      linkId,
      userId: link.userId,
      eventType: 'view',
      request: {
        ip: assessment.visitorHash,
        referer: assessment.referer,
        userAgent: assessment.userAgent,
        url: request.url,
      },
    })

    return NextResponse.json({
      success: true,
      counted: true,
      views: updatedLink.views,
      clicks: updatedLink.clicks,
      clickId: clickRecord.id,
    })
  } catch (error) {
    console.error('Error tracking view:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const linkId = new URL(request.url).searchParams.get('linkId')
    if (!linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { views: true, clicks: true },
    })
    if (!link) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    return NextResponse.json({ views: link.views, clicks: link.clicks })
  } catch (error) {
    console.error('Error fetching view count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
