import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { linkId, encodedData, timestamp, validation } = body

    // Vérifier que la requête est légitime
    if (!linkId || !encodedData || !timestamp || !validation) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Vérifier que le timestamp n'est pas trop ancien (max 5 minutes)
    const now = Date.now()
    if (now - timestamp > 5 * 60 * 1000) {
      return NextResponse.json({ error: 'Request expired' }, { status: 400 })
    }

    // Décoder et vérifier les données
    try {
      const decoded = JSON.parse(Buffer.from(encodedData, 'base64').toString())
      if (decoded.id !== linkId) {
        return NextResponse.json({ error: 'Invalid data' }, { status: 400 })
      }
    } catch (e) {
      return NextResponse.json({ error: 'Invalid encoded data' }, { status: 400 })
    }

    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for') || 
                     headersList.get('x-real-ip') || 
                     'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'
    const referer = headersList.get('referer') || null

    // Vérifier que ce n'est pas un bot connu
    const botPatterns = [
      'bot', 'crawler', 'spider', 'scraper', 'facebookexternalhit',
      'whatsapp', 'telegram', 'twitter', 'pinterest', 'linkedin',
      'metainspector', 'outbrain', 'newspaper', 'axios', 'pcore-http'
    ]
    
    const isBot = botPatterns.some(pattern => 
      userAgent.toLowerCase().includes(pattern)
    )

    // Si c'est un bot, on enregistre mais on marque différemment
    if (isBot) {
      console.log('Bot detected:', userAgent)
      // On pourrait choisir de ne pas enregistrer du tout
      // return NextResponse.json({ success: true })
    }

    // Enregistrer le clic
    await prisma.$transaction([
      prisma.link.update({
        where: { id: linkId },
        data: { clicks: { increment: 1 } },
      }),
      prisma.click.create({
        data: {
          linkId,
          ipAddress,
          userAgent,
          referer,
          country: null, // Peut être ajouté avec un service de géolocalisation
        },
      }),
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Track click error:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}