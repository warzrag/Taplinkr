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

    const { slug, count } = await request.json()
    if (!slug) {
      return NextResponse.json({ error: 'Slug requis' }, { status: 400 })
    }

    const clicksToAdd = Number(count) > 0 ? Number(count) : 100
    const link = await prisma.link.findUnique({ where: { slug } })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouve', slug }, { status: 404 })
    }

    const updatedLink = await prisma.link.update({
      where: { id: link.id },
      data: {
        clicks: { increment: clicksToAdd },
        views: { increment: clicksToAdd },
      },
    })

    return NextResponse.json({
      success: true,
      message: `Ajoute ${clicksToAdd} clics au lien ${slug}`,
      before: { clicks: link.clicks || 0, views: link.views || 0 },
      after: { clicks: updatedLink.clicks || 0, views: updatedLink.views || 0 },
      updatedLink: {
        id: updatedLink.id,
        title: updatedLink.title,
        slug: updatedLink.slug,
        clicks: updatedLink.clicks,
        views: updatedLink.views,
      },
    })
  } catch (error: any) {
    console.error('Erreur add-clicks:', error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}
