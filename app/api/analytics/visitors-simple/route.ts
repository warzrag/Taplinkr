import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const device = searchParams.get('device') || 'all'
    const offset = (page - 1) * limit

    // Récupérer tous les liens de l'utilisateur
    const userLinks = await prisma.link.findMany({
      where: { userId: session.user.id },
      select: { id: true, slug: true, title: true }
    })

    const linkIds = userLinks.map(link => link.id)
    
    if (linkIds.length === 0) {
      return NextResponse.json({
        visitors: [],
        total: 0,
        page,
        totalPages: 0
      })
    }
    
    // Créer un map pour accès rapide aux infos des liens
    const linkMap = new Map(userLinks.map(link => [link.id, link]))

    // Construire les conditions de filtre
    const whereConditions: any = {
      linkId: { in: linkIds }
    }

    // Filtrage par device si spécifié (basé sur userAgent car 'device' contient le nom)
    if (device === 'mobile') {
      whereConditions.OR = [
        { userAgent: { contains: 'Mobile', mode: 'insensitive' } },
        { userAgent: { contains: 'Android', mode: 'insensitive' } },
        { userAgent: { contains: 'iPhone', mode: 'insensitive' } }
      ]
    } else if (device === 'desktop') {
      whereConditions.AND = [
        { userAgent: { not: { contains: 'Mobile', mode: 'insensitive' } } },
        { userAgent: { not: { contains: 'Tablet', mode: 'insensitive' } } },
        { userAgent: { not: { contains: 'iPad', mode: 'insensitive' } } }
      ]
    }

    // Récupérer les clics avec toutes les données nécessaires
    const [clicks, total] = await Promise.all([
      prisma.click.findMany({
        where: whereConditions,
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          userAgent: true,
          ip: true,
          referer: true,
          linkId: true,
          country: true,
          city: true,
          region: true,
          browser: true,
          os: true,
          device: true,
          screenResolution: true,
          language: true,
          timezone: true,
          duration: true,
          multiLinkId: true,
          latitude: true,
          longitude: true
        }
      }),
      prisma.click.count({
        where: whereConditions
      })
    ])

    // Transformer les clics en format visiteur
    const visitors = clicks.map((click) => {
      const link = linkMap.get(click.linkId)

      // Utiliser les données déjà stockées dans la BDD (mieux que de re-parser userAgent)
      const userAgent = click.userAgent || ''
      const browser = click.browser || 'Unknown'
      const os = click.os || 'Unknown'
      const deviceName = click.device || 'Unknown'

      // Déterminer le type d'appareil
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        deviceType = 'mobile'
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceType = 'tablet'
      }

      // Extraire le code pays (2 lettres) depuis le nom du pays si possible
      let countryCode = 'XX'
      const country = click.country || 'Unknown'

      // Mapping simple des pays vers codes ISO-2
      const countryToCode: Record<string, string> = {
        'France': 'FR',
        'United States': 'US',
        'United Kingdom': 'GB',
        'Germany': 'DE',
        'Spain': 'ES',
        'Italy': 'IT',
        'Canada': 'CA',
        'Belgium': 'BE',
        'Netherlands': 'NL',
        'Switzerland': 'CH',
        'Unknown': 'XX'
      }
      countryCode = countryToCode[country] || 'XX'

      // Extraction sécurisée du referrer domain
      let referrerDomain = 'Direct'
      if (click.referer) {
        try {
          referrerDomain = new URL(click.referer).hostname
        } catch {
          referrerDomain = 'Direct'
        }
      }

      return {
        id: click.id,
        timestamp: click.createdAt.toISOString(),
        location: {
          city: click.city || 'Unknown',
          region: click.region || 'Unknown',
          country: country,
          countryCode: countryCode,
          latitude: click.latitude || undefined,
          longitude: click.longitude || undefined
        },
        linkSlug: link?.slug || 'unknown',
        linkTitle: link?.title || 'Lien supprimé',
        browser: browser,
        os: os,
        referrer: click.referer || '',
        referrerDomain: referrerDomain,
        device: deviceName,
        deviceType: deviceType,
        status: 'success' as const,
        ip: click.ip || '',
        userAgent: userAgent,
        screenResolution: click.screenResolution || undefined,
        language: click.language || undefined,
        timezone: click.timezone || undefined,
        duration: click.duration || undefined,
        multiLinkClicked: click.multiLinkId || undefined
      }
    })

    return NextResponse.json({
      visitors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Erreur lors de la récupération des visiteurs:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des visiteurs' },
      { status: 500 }
    )
  }
}