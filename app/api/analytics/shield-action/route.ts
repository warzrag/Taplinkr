import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, action, isBot } = body
    
    if (!linkId || !['proceed', 'blocked', 'view'].includes(action)) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    const link = await prisma.link.findUnique({ where: { id: linkId }, select: { userId: true, isActive: true } })
    if (!link?.isActive) return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    const ip = (request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown').trim().slice(0, 64)
    const recentEvents = await prisma.analyticsEvent.count({
      where: { linkId, ip, createdAt: { gte: new Date(Date.now() - 60_000) } }
    })
    if (recentEvents >= 10) return NextResponse.json({ error: 'Too many requests' }, { status: 429 })

    await prisma.analyticsEvent.create({
      data: {
        linkId,
        userId: link.userId,
        eventType: `shield_${action}`,
        ip,
        userAgent: request.headers.get('user-agent') || null,
        referer: request.headers.get('referer') || null,
        country: request.headers.get('x-vercel-ip-country') || null,
        device: isBot ? 'bot' : (request.headers.get('user-agent')?.includes('Mobile') ? 'mobile' : 'desktop'),
        browser: isBot ? 'bot' : null
      }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking shield action:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
