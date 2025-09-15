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

    // Filtrage par device désactivé pour l'instant car la colonne n'existe pas

    // Récupérer les clics avec seulement les colonnes de base
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
          linkId: true
        }
      }),
      prisma.click.count({
        where: whereConditions
      })
    ])

    // Transformer les clics en format visiteur simplifié
    const visitors = clicks.map((click) => {
      const link = linkMap.get(click.linkId)
      
      // Extraction simple du navigateur et OS
      const userAgent = click.userAgent || ''
      let browser = 'Unknown'
      let os = 'Unknown'
      
      // Détection basique du navigateur
      if (userAgent.includes('Chrome')) browser = 'Chrome'
      else if (userAgent.includes('Safari')) browser = 'Safari'
      else if (userAgent.includes('Firefox')) browser = 'Firefox'
      else if (userAgent.includes('Edge')) browser = 'Edge'
      
      // Détection basique de l'OS
      if (userAgent.includes('Windows')) os = 'Windows'
      else if (userAgent.includes('Mac')) os = 'macOS'
      else if (userAgent.includes('Linux')) os = 'Linux'
      else if (userAgent.includes('Android')) os = 'Android'
      else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS'
      
      // Déterminer le type d'appareil depuis le userAgent
      let deviceName = 'Desktop Computer'
      let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop'
      
      if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
        deviceName = 'Mobile Phone'
        deviceType = 'mobile'
      } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
        deviceName = 'Tablet'
        deviceType = 'tablet'
      }

      return {
        id: click.id,
        timestamp: click.createdAt.toISOString(),
        location: {
          city: 'N/A',
          region: 'N/A',
          country: 'Unknown',
          countryCode: 'XX'
        },
        linkSlug: link?.slug || 'unknown',
        linkTitle: link?.title || 'Lien supprimé',
        browser: browser,
        os: os,
        referrer: click.referer || '',
        referrerDomain: click.referer ? new URL(click.referer).hostname : 'Direct',
        device: deviceName,
        deviceType: deviceType,
        status: 'success' as const,
        ip: click.ip || '',
        userAgent: userAgent
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