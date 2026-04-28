import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const { action, data } = await request.json()

    switch (action) {
      case 'ADD_TEST_CLICKS': {
        const slug = data?.slug || 'lauravissantes'
        const count = Number(data?.count) > 0 ? Number(data.count) : 10
        const link = await prisma.link.findUnique({ where: { slug } })

        if (!link) {
          return NextResponse.json({ error: 'Lien non trouve', slug }, { status: 404 })
        }

        const updated = await prisma.link.update({
          where: { id: link.id },
          data: {
            clicks: { increment: count },
            views: { increment: count },
          },
        })

        const clicksToCreate = Math.min(count, 10)
        for (let i = 0; i < clicksToCreate; i++) {
          await prisma.click.create({
            data: {
              linkId: link.id,
              userId: link.userId,
              ip: `127.0.0.${i}`,
              userAgent: 'Test Bot',
              referer: 'test',
              device: 'desktop',
              country: 'France',
            },
          }).catch(() => undefined)
        }

        return NextResponse.json({
          success: true,
          message: `Ajoute ${count} clics au lien ${slug}`,
          updated,
        })
      }

      case 'RESET_ALL_CLICKS': {
        await prisma.link.updateMany({ data: { clicks: 0, views: 0 } })
        await prisma.click.deleteMany({})
        return NextResponse.json({
          success: true,
          message: 'Tous les compteurs ont ete reinitialises',
        })
      }

      case 'GET_STATS': {
        const totalLinks = await prisma.link.count()
        const totalClicks = await prisma.click.count()
        const links = await prisma.link.findMany({
          select: { id: true, title: true, slug: true, clicks: true, views: true },
        })

        return NextResponse.json({
          totalLinks,
          totalClicks,
          links,
          totalClicksSum: links.reduce((sum: number, l: any) => sum + (l.clicks || 0), 0),
        })
      }

      default:
        return NextResponse.json({ error: 'Action inconnue' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Erreur DB Admin:', error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}
