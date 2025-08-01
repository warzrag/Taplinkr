import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, action, isBot } = body
    
    if (!linkId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    
    // Enregistrer l'événement d'analyse
    await prisma.analyticsEvent.create({
      data: {
        linkId,
        userId: (await prisma.link.findUnique({ where: { id: linkId }, select: { userId: true } }))?.userId || '',
        eventType: `shield_${action}`,
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