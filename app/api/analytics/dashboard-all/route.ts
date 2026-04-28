import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const countryNameToCode: Record<string, string> = {
  France: 'FR',
  'United States': 'US',
  'United Kingdom': 'GB',
  Germany: 'DE',
  Spain: 'ES',
  Italy: 'IT',
  Canada: 'CA',
  Brazil: 'BR',
  Japan: 'JP',
  China: 'CN',
  India: 'IN',
  Australia: 'AU',
  Mexico: 'MX',
  Russia: 'RU',
  'South Africa': 'ZA',
  Belgium: 'BE',
  Netherlands: 'NL',
  Switzerland: 'CH',
  Sweden: 'SE',
  Norway: 'NO',
  Portugal: 'PT',
  Austria: 'AT',
  Denmark: 'DK',
  Finland: 'FI',
  Greece: 'GR',
  Poland: 'PL',
  Romania: 'RO',
  'Czech Republic': 'CZ',
  Czechia: 'CZ',
  Hungary: 'HU',
  Slovakia: 'SK',
  Bulgaria: 'BG',
  Croatia: 'HR',
  Slovenia: 'SI',
  Lithuania: 'LT',
  Latvia: 'LV',
  Estonia: 'EE',
  Ireland: 'IE',
  Luxembourg: 'LU',
  Malta: 'MT',
  Cyprus: 'CY',
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const userId = session.user.id
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { teamId: true },
    })

    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const sevenDaysAgo = new Date(today)
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
    sevenDaysAgo.setHours(0, 0, 0, 0)

    const linkWhere = {
      OR: [
        { userId },
        ...(user?.teamId ? [{
          teamId: user.teamId,
          teamShared: true,
        }] : []),
      ],
    }

    const [linksAggregate, topLinks, allLinkIds] = await Promise.all([
      prisma.link.aggregate({
        where: linkWhere,
        _count: { id: true },
        _sum: { clicks: true, views: true },
      }),
      prisma.link.findMany({
        where: linkWhere,
        select: {
          id: true,
          title: true,
          internalName: true,
          slug: true,
          clicks: true,
          views: true,
        },
        orderBy: { clicks: 'desc' },
        take: 5,
      }),
      prisma.link.findMany({
        where: linkWhere,
        select: { id: true },
      }),
    ])

    const linkIds = allLinkIds.map((link: any) => link.id)
    const clickWhere = linkIds.length
      ? { linkId: { in: linkIds } }
      : { linkId: '__no_matching_links__' }

    const [clickStats, uniqueVisitors, recentClicks] = await Promise.all([
      // Firestore cannot emulate Prisma relation filters such as
      // `where: { link: linkWhere }`, so use the matching link IDs instead.
      prisma.click.groupBy({
        by: ['country'],
        where: {
          ...clickWhere,
          country: { not: 'Unknown' },
        },
        _count: { id: true },
      }),
      prisma.click.groupBy({
        by: ['ip'],
        where: clickWhere,
      }),
      prisma.click.findMany({
        where: {
          ...clickWhere,
          createdAt: { gte: sevenDaysAgo, lte: today },
        },
        select: { createdAt: true },
      }),
    ])

    const totalLinks = linksAggregate._count.id
    const totalClicks = linksAggregate._sum.clicks || 0
    const totalViews = linksAggregate._sum.views || totalClicks

    const formattedTopLinks = topLinks.map((link: any) => ({
      id: link.id,
      title: link.title,
      internalName: link.internalName,
      slug: link.slug,
      clicks: link.clicks || 0,
      views: link.views || 0,
      _count: {
        analyticsEvents: link.clicks || 0,
      },
    }))

    const topCountries = clickStats
      .sort((a: any, b: any) => b._count.id - a._count.id)
      .slice(0, 10)
      .map((item: any) => {
        const countryCode = countryNameToCode[item.country] || item.country
        return [countryCode, item._count.id]
      })

    const clicksByDay = new Map<string, number>()
    for (let i = 0; i < 7; i++) {
      const date = new Date(sevenDaysAgo)
      date.setDate(date.getDate() + i)
      clicksByDay.set(date.toISOString().split('T')[0], 0)
    }

    recentClicks.forEach((click: any) => {
      const dateKey = new Date(click.createdAt).toISOString().split('T')[0]
      if (clicksByDay.has(dateKey)) {
        clicksByDay.set(dateKey, (clicksByDay.get(dateKey) || 0) + 1)
      }
    })

    const summary = Array.from(clicksByDay.entries()).map(([date, clicks]) => ({
      date,
      clicks,
    }))

    return NextResponse.json({
      totalLinks,
      totalClicks,
      totalViews,
      uniqueVisitors: uniqueVisitors.length,
      clicksChange: 0,
      viewsChange: 0,
      visitorsChange: 0,
      topLinks: formattedTopLinks,
      topCountries,
      summary,
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
        Pragma: 'no-cache',
      },
    })
  } catch (error: any) {
    console.error('Erreur dashboard-all:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error.message,
    }, { status: 500 })
  }
}
