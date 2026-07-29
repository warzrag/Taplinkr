import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { RESERVED_USERNAMES } from '@/lib/username'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const linkId = searchParams.get('linkId') // Pour exclure le lien actuel en cas d'édition

    if (!slug) {
      return NextResponse.json({ available: false, error: 'Slug is required' })
    }

    // Vérifier si le slug existe déjà
    const normalizedSlug = slug.trim().toLowerCase()
    if (!/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(normalizedSlug) || RESERVED_USERNAMES.has(normalizedSlug)) {
      return NextResponse.json({ available: false, error: 'Invalid or reserved URL' })
    }

    // Slugs are unique. Compare the current link id after the lookup so
    // Firestore does not need a composite index for `slug + id`.
    const existingLink = await prisma.link.findUnique({
      where: { slug: normalizedSlug }
    })

    return NextResponse.json({
      available: !existingLink || existingLink.id === linkId,
      slug: normalizedSlug
    })

  } catch (error) {
    console.error('Erreur vérification slug:', error)
    return NextResponse.json({ error: 'Unable to check this URL' }, { status: 500 })
  }
}
