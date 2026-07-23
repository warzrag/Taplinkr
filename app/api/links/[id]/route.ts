import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { cache } from '@/lib/redis-cache'
import { revalidatePath } from 'next/cache'
import { normalizeHttpURL, validateURL } from '@/lib/url-validator'
import { checkTeamPermission } from '@/lib/team-permissions'
import { canDeleteLink } from '@/lib/team-links'
import { RESERVED_USERNAMES } from '@/lib/username'

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const link = await prisma.link.findFirst({
      where: {
        id: params.id,
        userId: session.user.id
      },
      include: {
        multiLinks: {
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors de la récupération du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    const existingLink = await prisma.link.findFirst({
      where: { id: params.id, userId: session.user.id },
    })

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    if (shieldEnabled && !existingLink.shieldEnabled && !(await checkTeamPermission(session.user.id, 'hasShieldLink'))) {
      return NextResponse.json({ error: 'Shield Protection nécessite le plan Premium' }, { status: 403 })
    }

    if (isUltraLink && !existingLink.isUltraLink && !(await checkTeamPermission(session.user.id, 'hasUltraLink'))) {
      return NextResponse.json({ error: 'Ultra Link nécessite le plan Premium' }, { status: 403 })
    }

    const effectiveIsDirect = isDirect ?? existingLink.isDirect
    const effectiveDirectUrl = effectiveIsDirect
      ? normalizeHttpURL(directUrl ?? existingLink.directUrl ?? '')
      : null
    if (effectiveIsDirect && (!effectiveDirectUrl || !validateURL(effectiveDirectUrl))) {
      return NextResponse.json({ error: 'URL de redirection invalide. Seuls http:// et https:// sont autorisés.' }, { status: 400 })
    }

    if (multiLinks !== undefined) {
      if (!Array.isArray(multiLinks) || (!effectiveIsDirect && multiLinks.length === 0)) {
        return NextResponse.json({ error: 'Au moins un sous-lien valide est requis.' }, { status: 400 })
      }
      for (const item of multiLinks) {
        if (!item?.title || !item?.url || !validateURL(item.url)) {
          return NextResponse.json({ error: 'Chaque sous-lien doit avoir un titre et une URL http(s) valide.' }, { status: 400 })
        }
      }
    }

    if (slug !== undefined) {
      const normalizedSlug = String(slug).trim().toLowerCase()
      if (!/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(normalizedSlug) || RESERVED_USERNAMES.has(normalizedSlug)) {
        return NextResponse.json({ error: 'Le slug doit contenir 3 à 50 caractères alphanumériques ou tirets.' }, { status: 400 })
      }
      const slugOwner = await prisma.link.findFirst({ where: { slug: normalizedSlug, id: { not: params.id } } })
      if (slugOwner) return NextResponse.json({ error: 'Cette URL personnalisée est déjà utilisée.' }, { status: 409 })
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
        ...(slug !== undefined && { slug: String(slug).trim().toLowerCase() }),
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
        ...(directUrl !== undefined && { directUrl: effectiveDirectUrl }),
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

    // Invalider le cache après mise à jour
    await cache.del(`links:user:${session.user.id}`)
    console.log(`🗑️ Cache invalidé pour user ${session.user.id}`)

    // ⚡ Revalider la page publique pour mise à jour instantanée
    if (existingLink.slug) {
      revalidatePath(`/${existingLink.slug}`, 'page')
      console.log(`🔄 Page revalidée: /${existingLink.slug}`)
    }

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

export async function PATCH(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    // Invalider le cache après mise à jour
    await cache.del(`links:user:${session.user.id}`)
    console.log(`🗑️ Cache invalidé pour user ${session.user.id}`)

    // ⚡ Revalider la page publique
    if (existingLink.slug) {
      revalidatePath(`/${existingLink.slug}`, 'page')
      console.log(`🔄 Page revalidée: /${existingLink.slug}`)
    }

    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors de la mise à jour partielle du lien:', error)
    return NextResponse.json({
      error: 'Erreur serveur',
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const [existingLink, currentUser] = await Promise.all([
      prisma.link.findUnique({
        where: { id: params.id },
      }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { teamId: true, teamRole: true },
      }),
    ])

    if (!existingLink) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    if (!canDeleteLink({
      actorUserId: session.user.id,
      actorTeamId: currentUser?.teamId,
      actorTeamRole: currentUser?.teamRole,
      linkUserId: existingLink.userId,
      linkTeamId: existingLink.teamId,
    })) {
      return NextResponse.json({
        error: 'Vous n’avez pas la permission de supprimer ce lien',
      }, { status: 403 })
    }

    const schedule = await prisma.linkSchedule.findFirst({
      where: { linkId: params.id },
      select: { id: true },
    })

    if (schedule) {
      await prisma.scheduledJob.deleteMany({
        where: { scheduleId: schedule.id },
      })
    }

    await Promise.all([
      prisma.multiLink.deleteMany({ where: { parentLinkId: params.id } }),
      prisma.click.deleteMany({ where: { linkId: params.id } }),
      prisma.filteredClick.deleteMany({ where: { linkId: params.id } }),
      prisma.analyticsEvent.deleteMany({ where: { linkId: params.id } }),
      prisma.analyticsSummary.deleteMany({ where: { linkId: params.id } }),
      prisma.passwordAttempt.deleteMany({ where: { linkId: params.id } }),
      prisma.passwordProtection.deleteMany({ where: { linkId: params.id } }),
      prisma.linkSchedule.deleteMany({ where: { linkId: params.id } }),
      prisma.teamLinkHistory.deleteMany({ where: { linkId: params.id } }),
      prisma.teamAuditLog.updateMany({
        where: { linkId: params.id },
        data: { linkId: null },
      }),
    ])

    await prisma.link.delete({
      where: { id: params.id },
    })

    const affectedUsers = existingLink.teamId
      ? await prisma.user.findMany({
          where: { teamId: existingLink.teamId },
          select: { id: true },
        })
      : [{ id: session.user.id }]

    await Promise.all(
      affectedUsers.map(user => cache.del(`links:user:${user.id}`)),
    )

    if (existingLink.slug) {
      revalidatePath(`/${existingLink.slug}`, 'page')
    }
    revalidatePath('/dashboard/links')

    return NextResponse.json({ message: 'Lien supprimé' })
  } catch (error) {
    console.error('Erreur lors de la suppression du lien:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
