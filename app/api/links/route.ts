import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      orderBy: { order: 'asc' },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(links)
  } catch (error) {
    console.error('Erreur lors de la récupération des liens:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { 
      title, 
      description, 
      color, 
      icon, 
      coverImage,
      multiLinks
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    // Validation des multiLinks (toujours requis)
    if (!multiLinks || !Array.isArray(multiLinks) || multiLinks.length === 0) {
      return NextResponse.json({ error: 'Au moins un lien requis' }, { status: 400 })
    }
    
    // Valider chaque sous-lien
    for (const link of multiLinks) {
      if (!link.title || !link.url) {
        return NextResponse.json({ error: 'Chaque lien doit avoir un titre et une URL' }, { status: 400 })
      }
      try {
        new URL(link.url)
      } catch {
        return NextResponse.json({ error: `URL invalide: ${link.url}` }, { status: 400 })
      }
    }

    // Générer un slug unique basé sur le titre
    let baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    if (!baseSlug) {
      baseSlug = 'link'
    }

    let slug = baseSlug
    let counter = 1

    while (await prisma.link.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Obtenir le prochain ordre
    const maxOrder = await prisma.link.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: 'desc' },
      select: { order: true }
    })

    const link = await prisma.link.create({
      data: {
        slug,
        title,
        description: description || null,
        color: color || null,
        icon: icon || null,
        coverImage: coverImage || null,
        order: (maxOrder?.order || 0) + 1,
        userId: session.user.id
      }
    })

    // Créer les sous-liens (toujours requis maintenant)
    await Promise.all(
      multiLinks.map((subLink: any, index: number) =>
        prisma.multiLink.create({
          data: {
            title: subLink.title,
            url: subLink.url,
            description: subLink.description || null,
            icon: subLink.icon || null,
            order: index,
            parentLinkId: link.id
          }
        })
      )
    )

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}