import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const linkId = searchParams.get('linkId') // Pour exclure le lien actuel en cas d'édition

    if (!slug) {
      return NextResponse.json({ available: false, error: 'Slug requis' })
    }

    // Vérifier si le slug existe déjà
    const existingLink = await prisma.link.findFirst({
      where: {
        slug: slug,
        id: linkId ? { not: linkId } : undefined
      }
    })

    return NextResponse.json({
      available: !existingLink,
      slug: slug
    })

  } catch (error) {
    console.error('Erreur vérification slug:', error)
    return NextResponse.json({ error: 'Erreur lors de la vérification' }, { status: 500 })
  }
}