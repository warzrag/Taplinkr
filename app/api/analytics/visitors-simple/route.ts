import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const device = searchParams.get('device') || 'all'
    const offset = (page - 1) * limit

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true },
    })
    const teamMembers = currentUser?.teamId
      ? await prisma.user.findMany({
          where: { teamId: currentUser.teamId },
          select: { id: true },
        })
      : []
    const visibleUserIds = [...new Set([session.user.id, ...teamMembers.map(member => member.id)])]

    const userLinks = await prisma.link.findMany({
      where: currentUser?.teamId
        ? {
            OR: [
              { userId: { in: visibleUserIds } },
              { teamId: currentUser.teamId, teamShared: true },
            ],
          }
        : { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        multiLinks: { select: { id: true, title: true } },
      },
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
    const linkMap = new Map<string, { slug: string; title: string; multiLinks: Array<{ id: string; title: string }> }>(
      userLinks.map(link => [link.id, link])
    )

    // Construire les conditions de filtre
    const whereConditions: any = {
      linkId: { in: linkIds }
    }

    if (device === 'mobile') {
      whereConditions.device = { in: ['mobile', 'tablet'] }
    } else if (device === 'desktop') {
      whereConditions.device = 'desktop'
    }

    const clickSelect = {
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
      longitude: true,
    } as const

    let clicks
    let total
    try {
      ;[clicks, total] = await Promise.all([
        prisma.click.findMany({
          where: whereConditions,
          orderBy: { createdAt: 'desc' },
          skip: offset,
          take: limit,
          select: clickSelect,
        }),
        prisma.click.count({ where: whereConditions }),
      ])
    } catch (queryError) {
      const message = queryError instanceof Error ? queryError.message : String(queryError)
      if (!message.includes('FAILED_PRECONDITION') && !message.includes('requires an index')) {
        throw queryError
      }

      // Firestore indexes can take a few minutes to build after deployment.
      // Keep the click log available in the meantime with a bounded in-memory fallback.
      const unfilteredClicks = await prisma.click.findMany({
        select: clickSelect,
      })
      const filteredClicks = unfilteredClicks
        .filter(click => linkIds.includes(click.linkId))
        .filter(click => device === 'all' || (device === 'mobile'
          ? click.device === 'mobile' || click.device === 'tablet'
          : click.device === 'desktop'))
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())

      total = filteredClicks.length
      clicks = filteredClicks.slice(offset, offset + limit)
    }

    // Transformer les clics en format visiteur
    const visitors = clicks.map((click) => {
      const link = linkMap.get(click.linkId)

      // Utiliser les données déjà stockées dans la BDD (mieux que de re-parser userAgent)
      const userAgent = click.userAgent || ''
      const browser = click.browser || 'Unknown'
      const os = click.os || 'Unknown'
      const deviceName = click.device || 'Unknown'

      const deviceType: 'mobile' | 'tablet' | 'desktop' =
        deviceName === 'tablet' || deviceName === 'mobile' || deviceName === 'desktop'
          ? deviceName
          : userAgent.includes('Tablet') || userAgent.includes('iPad')
            ? 'tablet'
            : userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')
              ? 'mobile'
              : 'desktop'

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
      countryCode = /^[A-Z]{2}$/i.test(country) ? country.toUpperCase() : countryToCode[country] || 'XX'

      // Extraction sécurisée du referrer domain
      let referrerDomain = 'Direct'
      if (click.referer) {
        try {
          referrerDomain = new URL(click.referer).hostname
        } catch {
          referrerDomain = 'Direct'
        }
      }
      const normalizedReferrer = referrerDomain.toLowerCase()
      const trafficSource = normalizedReferrer.includes('instagram')
        ? 'Instagram'
        : normalizedReferrer === 't.co' || normalizedReferrer.includes('twitter') || normalizedReferrer.includes('x.com')
          ? 'X / Twitter'
          : normalizedReferrer.includes('tiktok')
            ? 'TikTok'
            : normalizedReferrer.includes('facebook')
              ? 'Facebook'
              : normalizedReferrer.includes('google')
                ? 'Google'
                : normalizedReferrer === 'direct'
                  ? 'Direct'
                  : referrerDomain
      const multiLink = link?.multiLinks.find(item => item.id === click.multiLinkId)

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
        linkTitle: link?.title || 'Deleted link',
        browser: browser,
        os: os,
        referrer: click.referer || '',
        referrerDomain: referrerDomain,
        trafficSource,
        device: deviceName,
        deviceType: deviceType,
        status: 'success' as const,
        ip: click.ip || '',
        userAgent: userAgent,
        screenResolution: click.screenResolution || undefined,
        language: click.language || undefined,
        timezone: click.timezone || undefined,
        duration: click.duration || undefined,
        multiLinkClicked: multiLink?.title || undefined
      }
    })

    return NextResponse.json({
      visitors,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    })

  } catch (error) {
    console.error('Unable to fetch click log:', error)
    return NextResponse.json(
      { error: 'Unable to load the click log' },
      { status: 500 }
    )
  }
}
