import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Admin-only: bump the click/view counters on a link by slug.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { slug, count } = await request.json()
    const clicksToAdd = count || 100

    const link = await prisma.link.findUnique({ where: { slug } })
    if (!link) {
      return NextResponse.json({ error: 'Lien introuvable' }, { status: 404 })
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
      message: `Ajouté ${clicksToAdd} clics au lien ${slug}`,
      rowsAffected: 1,
      updatedLink: {
        id: updatedLink.id,
        title: updatedLink.title,
        slug: updatedLink.slug,
        clicks: updatedLink.clicks,
        views: updatedLink.views,
      },
    })

  } catch (error: any) {
    console.error('Erreur force-add-clicks:', error)
    return NextResponse.json({
      error: error.message || String(error),
      code: error.code
    }, { status: 500 })
  }
}
