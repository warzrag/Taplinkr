import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    
    // Log pour debug
    console.log('Données reçues pour mise à jour:', {
      id: params.id,
      body: JSON.stringify(body, null, 2)
    })
    
    const {
      title,
      internalName,
      slug,
      description,
      color,
      icon,
      coverImage,
      coverImagePosition,
      profileImage,
      isActive,
      fontFamily,
      borderRadius,
      backgroundColor,
      textColor,
      multiLinks,
      isDirect,
      directUrl,
      shieldEnabled,
      isUltraLink,
      isOnline,
      city,
      country,
      instagramUrl,
      tiktokUrl,
      twitterUrl,
      youtubeUrl
    } = body

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Pas de validation d'URL car c'est un multi-link

    // Mettre à jour les multiLinks d'abord s'ils sont fournis
    if (multiLinks !== undefined) {
      // Supprimer les anciens multiLinks
      await prisma.multiLink.deleteMany({
        where: { parentLinkId: params.id }
      })

      // Créer les nouveaux multiLinks
      if (multiLinks && multiLinks.length > 0) {
        await prisma.multiLink.createMany({
          data: multiLinks.map((ml: any, index: number) => ({
            parentLinkId: params.id,
            title: ml.title,
            url: ml.url,
            description: ml.description || null,
            icon: ml.icon || null,
            iconImage: ml.iconImage || null,
            animation: ml.animation || null,
            order: ml.order || index
          }))
        })
      }
    }

    const link = await prisma.link.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(internalName !== undefined && { internalName: internalName || null }),
        ...(slug !== undefined && { slug }),
        ...(description !== undefined && { description: description || null }),
        ...(color !== undefined && { color: color || null }),
        ...(icon !== undefined && { icon: icon || null }),
        ...(coverImage !== undefined && { coverImage: coverImage || null }),
        ...(coverImagePosition !== undefined && { coverImagePosition: coverImagePosition || null }),
        ...(profileImage !== undefined && { profileImage: profileImage || null }),
        ...(fontFamily !== undefined && { fontFamily: fontFamily || null }),
        ...(borderRadius !== undefined && { borderRadius: borderRadius || null }),
        ...(backgroundColor !== undefined && { backgroundColor: backgroundColor || null }),
        ...(textColor !== undefined && { textColor: textColor || null }),
        ...(isActive !== undefined && { isActive }),
        ...(isDirect !== undefined && { isDirect }),
        ...(directUrl !== undefined && { directUrl: directUrl || null }),
        ...(shieldEnabled !== undefined && { shieldEnabled: isDirect ? shieldEnabled : false }),
        ...(isUltraLink !== undefined && { isUltraLink: isDirect ? isUltraLink : false }),
        ...(isOnline !== undefined && { isOnline }),
        ...(city !== undefined && { city: city || null }),
        ...(country !== undefined && { country: country || null }),
        ...(instagramUrl !== undefined && { instagramUrl: instagramUrl || null }),
        ...(tiktokUrl !== undefined && { tiktokUrl: tiktokUrl || null }),
        ...(twitterUrl !== undefined && { twitterUrl: twitterUrl || null }),
        ...(youtubeUrl !== undefined && { youtubeUrl: youtubeUrl || null }),
        ...((shieldEnabled !== undefined || isUltraLink !== undefined) && {
          shieldConfig: (isDirect && (shieldEnabled || isUltraLink)) ? JSON.stringify({
            level: isUltraLink ? 3 : 2,
            timer: isUltraLink ? 5000 : 3000,
            features: isUltraLink ? ['adaptive-content', 'domain-rotation', 'js-obfuscation', 'ai-detection'] : ['timer', 'basic-detection']
          }) : null
        })
      },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors de la mise à jour du lien:', error)
    // Afficher plus de détails sur l'erreur
    if (error instanceof Error) {
      console.error('Message d\'erreur:', error.message)
      console.error('Stack trace:', error.stack)
    }
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    // Mise à jour partielle (utilisé pour le renommage rapide)
    const link = await prisma.link.update({
      where: { id: params.id },
      data: {
        ...(body.internalName !== undefined && { internalName: body.internalName || null })
      }
    })

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors de la mise à jour partielle du lien:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Vérifier que le lien appartient à l'utilisateur
    const existingLink = await prisma.link.findFirst({
      where: { id: params.id, userId: session.user.id }
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    await prisma.link.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Lien supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}