import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { nanoid } from 'nanoid'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkTeamLimit, checkTeamPermission } from '@/lib/team-permissions'
import { getTeamLinkCreationFields } from '@/lib/team-links'
import { hasTeamActionPermission, TeamAction } from '@/lib/team-roles'
import { getUpgradeMessage } from '@/lib/permissions'
import { normalizeHttpURL, validateURL } from '@/lib/url-validator'
import { RESERVED_USERNAMES } from '@/lib/username'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorise' }, { status: 401 })
    }

    const body = await request.json()
    const slug = String(body.slug || nanoid(10)).trim().toLowerCase()
    const directUrl = body.isDirect ? normalizeHttpURL(body.directUrl || '') : null
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true },
    })

    if (currentUser?.teamId && !hasTeamActionPermission(currentUser.teamRole, TeamAction.CREATE_LINK)) {
      return NextResponse.json({ error: 'Vous n’avez pas la permission de créer un lien dans cette équipe' }, { status: 403 })
    }

    if (!/^[a-z0-9](?:[a-z0-9-]{1,48}[a-z0-9])?$/.test(slug) || RESERVED_USERNAMES.has(slug)) {
      return NextResponse.json({ error: 'URL publique invalide ou réservée' }, { status: 400 })
    }

    const existingLink = await prisma.link.findUnique({ where: { slug } })
    if (existingLink) {
      return NextResponse.json({ error: 'Cette URL personnalisee est deja utilisee' }, { status: 400 })
    }

    if (body.isDirect && (!directUrl || !validateURL(directUrl))) {
      return NextResponse.json({ error: 'URL de redirection invalide' }, { status: 400 })
    }

    if (!body.isDirect && Array.isArray(body.multiLinks)) {
      for (const link of body.multiLinks) {
        if (link?.url && !validateURL(link.url)) {
          return NextResponse.json({ error: `URL invalide ou dangereuse: ${link.url}` }, { status: 400 })
        }
      }
    }

    const linkCount = await prisma.link.count({ where: { userId: session.user.id } })
    if (!(await checkTeamLimit(session.user.id, 'maxPages', linkCount))) {
      return NextResponse.json({
        error: 'Limite de pages atteinte',
        message: getUpgradeMessage('maxPages'),
      }, { status: 403 })
    }

    if (body.shieldEnabled && !(await checkTeamPermission(session.user.id, 'hasShieldLink'))) {
      return NextResponse.json({ error: 'Shield Protection nécessite le plan Premium' }, { status: 403 })
    }

    if (body.isUltraLink && !(await checkTeamPermission(session.user.id, 'hasUltraLink'))) {
      return NextResponse.json({ error: 'Ultra Link nécessite le plan Premium' }, { status: 403 })
    }

    const maxOrder = await prisma.link.findFirst({
      where: { userId: session.user.id },
      orderBy: { order: 'desc' },
      select: { order: true },
    })

    const newLink = await prisma.link.create({
      data: {
        userId: session.user.id,
        ...getTeamLinkCreationFields(session.user.id, currentUser?.teamId),
        title: body.title || 'Mon lien',
        internalName: body.internalName || null,
        slug,
        description: body.description || body.bio || '',
        bio: body.bio || body.description || '',
        directUrl,
        isDirect: !!body.isDirect,
        isActive: true,
        shieldEnabled: !!body.shieldEnabled,
        isUltraLink: !!body.isUltraLink,
        clicks: 0,
        views: 0,
        order: (maxOrder?.order || 0) + 1,
        color: body.color || body.primaryColor || '#3b82f6',
        icon: body.icon || '',
        profileImage: body.profileImage || null,
        profileStyle: body.profileStyle || 'circle',
        coverImage: body.coverImage || null,
        fontFamily: body.fontFamily || 'system',
        borderRadius: body.borderRadius || 'rounded-xl',
        backgroundColor: body.backgroundColor || '#ffffff',
        textColor: body.textColor || '#1f2937',
        instagramUrl: body.instagramUrl || null,
        tiktokUrl: body.tiktokUrl || null,
        twitterUrl: body.twitterUrl || null,
        youtubeUrl: body.youtubeUrl || null,
        animation: body.animation || 'none',
        isOnline: !!body.isOnline,
        city: body.city || null,
        country: body.country || null,
      },
    })

    let multiLinks: any[] = []
    if (!body.isDirect && Array.isArray(body.multiLinks) && body.multiLinks.length > 0) {
      multiLinks = await Promise.all(
        body.multiLinks.map((subLink: any, index: number) =>
          prisma.multiLink.create({
            data: {
              parentLinkId: newLink.id,
              title: subLink.title || `Lien ${index + 1}`,
              url: subLink.url,
              description: subLink.description || null,
              icon: subLink.icon || '',
              iconImage: subLink.iconImage || subLink.icon || '',
              animation: subLink.animation || null,
              order: typeof subLink.order === 'number' ? subLink.order : index,
              clicks: 0,
            },
          })
        )
      )
    }

    return NextResponse.json({ ...newLink, multiLinks })
  } catch (error: any) {
    console.error('Erreur creation lien FINAL:', error)
    return NextResponse.json({
      error: 'Erreur lors de la creation',
      message: error.message,
    }, { status: 500 })
  }
}
