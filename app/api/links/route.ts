import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'
import { checkLimit, getUpgradeMessage } from '@/lib/permissions'

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
      multiLinks,
      isDirect,
      directUrl,
      slug: customSlug
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    // Vérifier les limites du plan
    const userPermissions = {
      role: (session.user as any).role || 'user',
      plan: (session.user as any).plan || 'free',
      planExpiresAt: (session.user as any).planExpiresAt
    }

    // Compter les liens existants
    const linkCount = await prisma.link.count({
      where: { userId: session.user.id }
    })

    // Vérifier la limite de liens par page pour le plan gratuit
    if (!checkLimit(userPermissions, 'maxLinksPerPage', linkCount)) {
      return NextResponse.json({ 
        error: 'Limite de liens atteinte',
        message: getUpgradeMessage('maxLinksPerPage')
      }, { status: 403 })
    }

    // Validation selon le type de lien
    if (isDirect) {
      // Pour un lien direct, on vérifie l'URL de redirection
      if (!directUrl) {
        return NextResponse.json({ error: 'URL de redirection requise pour un lien direct' }, { status: 400 })
      }
      try {
        new URL(directUrl)
      } catch {
        return NextResponse.json({ error: `URL de redirection invalide: ${directUrl}` }, { status: 400 })
      }
    } else {
      // Pour un multi-liens, on vérifie les sous-liens
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
    }

    // Utiliser le slug personnalisé ou générer un slug unique basé sur le titre
    let slug = customSlug || ''
    
    if (!slug) {
      let baseSlug = title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50)
      
      if (!baseSlug) {
        baseSlug = 'link'
      }

      slug = baseSlug
      let counter = 1

      while (await prisma.link.findUnique({ where: { slug } })) {
        slug = `${baseSlug}-${counter}`
        counter++
      }
    } else {
      // Vérifier que le slug personnalisé est disponible
      const existingLink = await prisma.link.findUnique({ where: { slug } })
      if (existingLink) {
        return NextResponse.json({ error: 'Cette URL personnalisée est déjà utilisée' }, { status: 400 })
      }
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
        userId: session.user.id,
        isDirect: isDirect || false,
        directUrl: isDirect ? directUrl : null
      }
    })

    // Créer les sous-liens seulement si ce n'est pas un lien direct
    if (!isDirect && multiLinks && multiLinks.length > 0) {
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
    }

    return NextResponse.json(link, { status: 201 })
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}