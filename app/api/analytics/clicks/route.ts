import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { subDays } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')
    const range = searchParams.get('range') || '7d'

    if (!linkId) {
      return NextResponse.json({ error: 'linkId requis' }, { status: 400 })
    }

    // Vérifier que l'utilisateur possède ce lien
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: user.id
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Calculer la date de début selon le range
    let startDate: Date | undefined
    if (range === '7d') {
      startDate = subDays(new Date(), 7)
    } else if (range === '30d') {
      startDate = subDays(new Date(), 30)
    }
    // Si 'all', on ne met pas de startDate

    // Récupérer les clics
    const clicks = await prisma.click.findMany({
      where: {
        linkId: linkId,
        ...(startDate && { createdAt: { gte: startDate } })
      },
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        country: true,
        city: true,
        region: true,
        device: true,
        browser: true,
        os: true,
        referer: true,
        multiLinkId: true,
        ip: true
      }
    })

    return NextResponse.json({ clicks })
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
