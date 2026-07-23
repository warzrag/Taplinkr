import { NextRequest, NextResponse } from 'next/server'

import { analyticsService } from '@/lib/analytics-service'
import { assessClickRequest, recordFilteredClick } from '@/lib/click-quality'
import { getLocationFromIP } from '@/lib/geo-location-helper'
import { prisma } from '@/lib/prisma'
import { parseUserAgent } from '@/lib/user-agent-parser'

export async function POST(request: NextRequest) {
  try {
    const { linkId, screenResolution, language, timezone } = await request.json()
    if (typeof linkId !== 'string' || !linkId) {
      return NextResponse.json({ error: 'Link ID required' }, { status: 400 })
    }

    const link = await prisma.link.findUnique({
      where: { id: linkId },
      select: { id: true, userId: true, views: true, isDirect: true, isActive: true },
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

    const location = await getLocationFromIP(assessment.rawIp)
    const parsed = parseUserAgent(assessment.userAgent)
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
          ip: assessment.visitorHash,
          userAgent: assessment.userAgent,
          referer: assessment.referer,
          device: parsed.device.type,
          browser: parsed.browser.name,
          os: parsed.os.name,
          screenResolution: typeof screenResolution === 'string' ? screenResolution.slice(0, 32) : null,
          language: typeof language === 'string' ? language.slice(0, 32) : null,
          timezone: typeof timezone === 'string' ? timezone.slice(0, 64) : null,
          country: location.country,
          city: location.city || null,
          region: location.region || null,
          latitude: location.lat || null,
          longitude: location.lon || null,
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
