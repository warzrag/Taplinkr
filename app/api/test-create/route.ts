import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  // Désactiver cette route en production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Route désactivée en production' }, { status: 403 })
  }
  
  try {
    const body = await request.json()
    
    // Utiliser l'utilisateur test directement
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      return NextResponse.json({ error: 'Utilisateur test non trouvé' }, { status: 404 })
    }
    
    const { 
      title, 
      description, 
      color, 
      icon, 
      coverImage,
      multiLinks,
      profileImage,
      fontFamily,
      borderRadius,
      backgroundColor,
      textColor,
      animation
    } = body

    if (!title) {
      return NextResponse.json({ error: 'Titre requis' }, { status: 400 })
    }

    // Générer un slug unique
    let slug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) || 'link'
    
    let counter = 1
    while (await prisma.link.findUnique({ where: { slug } })) {
      slug = `${slug}-${counter}`
      counter++
    }

    // Créer le lien
    const link = await prisma.link.create({
      data: {
        slug,
        title,
        description: description || null,
        color: color || null,
        icon: icon || null,
        coverImage: coverImage || null,
        profileImage: profileImage || null,
        fontFamily: fontFamily || null,
        borderRadius: borderRadius || null,
        backgroundColor: backgroundColor || null,
        textColor: textColor || null,
        animation: animation || null,
        order: 1,
        userId: testUser.id,
        isDirect: false,
        isOnline: false
      }
    })

    // Créer les sous-liens
    if (multiLinks && multiLinks.length > 0) {
      await Promise.all(
        multiLinks.map((subLink: any, index: number) =>
          prisma.multiLink.create({
            data: {
              title: subLink.title,
              url: subLink.url,
              description: subLink.description || null,
              icon: subLink.icon || null,
              iconImage: subLink.iconImage || null,
              animation: subLink.animation || null,
              order: index,
              parentLinkId: link.id
            }
          })
        )
      )
    }

    // Récupérer le lien avec les multiLinks
    const fullLink = await prisma.link.findUnique({
      where: { id: link.id },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json({
      success: true,
      link: fullLink,
      url: `/link/${link.slug}`
    }, { status: 201 })
    
  } catch (error) {
    console.error('Erreur lors de la création du lien:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}