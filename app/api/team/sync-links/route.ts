import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  requireTeamPermission,
  TeamAction,
  logTeamAction,
  recordLinkHistory
} from '@/lib/team-permissions'

// GET: Récupérer tous les liens partagés de l'équipe
export async function GET(request: Request) {
  try {
    // 🔍 FALLBACK: Si requireTeamPermission échoue, utiliser la session directement
    const session = await getServerSession(authOptions)

    console.log('🔍 GET /api/team/sync-links - Session:')
    console.log('  session existe:', !!session)
    console.log('  session.user:', session?.user)

    if (!session?.user?.id) {
      console.log('  ❌ Pas de session')
      return NextResponse.json({ error: 'Non autorisé', links: [] }, { status: 401 })
    }

    // Récupérer l'utilisateur et son équipe
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { teamId: true, teamRole: true }
    })

    console.log('  user.teamId:', user?.teamId)
    console.log('  user.teamRole:', user?.teamRole)

    if (!user?.teamId) {
      console.log('  ❌ Utilisateur sans équipe')
      return NextResponse.json({ error: 'Pas d\'équipe', links: [] }, { status: 404 })
    }

    const userId = session.user.id
    const teamId = user.teamId

    // ⚡ Récupérer tous les liens de l'équipe (optimisé)
    const teamLinks = await prisma.link.findMany({
      where: {
        teamId: teamId,
        teamShared: true
      },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        clicks: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        lastModifiedBy: true,
        teamShared: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        originalOwner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        lastModifier: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: { multiLinks: true }
        }
      },
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    console.log('  ✅ Liens trouvés:', teamLinks.length)
    teamLinks.forEach((link, i) => {
      console.log('    Lien', i + 1 + ':', link.slug, '-', link.title)
    })

    // Logger l'accès (async, sans attendre)
    logTeamAction(teamId!, userId!, 'team_links_accessed', undefined, {
      count: teamLinks.length
    }, 'info', request).catch(() => {})

    const response = NextResponse.json({
      links: teamLinks,
      teamId,
      count: teamLinks.length
    })

    console.log('  📤 Retour API:', {
      count: teamLinks.length,
      teamId
    })

    // Cache HTTP pour performance
    response.headers.set('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    return response
  } catch (error) {
    console.error('❌ Erreur récupération liens équipe:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des liens', links: [] },
      { status: 500 }
    )
  }
}

// POST: Partager un lien avec l'équipe
export async function POST(request: Request) {
  try {
    const { authorized, userId, teamId, error } = await requireTeamPermission(TeamAction.SHARE_LINK)
    if (!authorized) return error

    const { linkId } = await request.json()

    if (!linkId) {
      return NextResponse.json(
        { error: 'ID du lien requis' },
        { status: 400 }
      )
    }

    // Vérifier que le lien appartient à l'utilisateur
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        userId: userId
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Lien non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Partager le lien avec l'équipe
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        teamShared: true,
        teamId: teamId,
        originalOwnerId: link.originalOwnerId || userId
      },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Enregistrer dans l'historique
    await recordLinkHistory(
      linkId,
      teamId!,
      userId!,
      'share',
      { teamShared: true },
      { previousState: { teamShared: false } }
    )

    // Logger l'action
    await logTeamAction(
      teamId!,
      userId!,
      'link_shared',
      linkId,
      {
        linkTitle: updatedLink.title,
        linkSlug: updatedLink.slug
      },
      'info',
      request
    )

    // Notifier les membres de l'équipe
    const teamMembers = await prisma.user.findMany({
      where: {
        teamId: teamId,
        id: { not: userId }
      },
      select: { id: true }
    })

    await Promise.all(
      teamMembers.map(member =>
        prisma.notification.create({
          data: {
            userId: member.id,
            type: 'team_link_shared',
            title: 'Nouveau lien partagé',
            message: `${updatedLink.user.name || updatedLink.user.email} a partagé le lien "${updatedLink.title}"`,
            data: JSON.stringify({ linkId, teamId })
          }
        })
      )
    )

    return NextResponse.json({
      message: 'Lien partagé avec succès',
      link: updatedLink
    })
  } catch (error) {
    console.error('Erreur partage lien:', error)
    return NextResponse.json(
      { error: 'Erreur lors du partage du lien' },
      { status: 500 }
    )
  }
}

// PUT: Mettre à jour un lien partagé
export async function PUT(request: Request) {
  try {
    const { authorized, userId, teamId, error } = await requireTeamPermission(TeamAction.EDIT_LINK)
    if (!authorized) return error

    const { linkId, updates } = await request.json()

    if (!linkId || !updates) {
      return NextResponse.json(
        { error: 'Données requises manquantes' },
        { status: 400 }
      )
    }

    // Vérifier que le lien est bien partagé avec l'équipe
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        teamId: teamId,
        teamShared: true
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Lien non trouvé ou non partagé' },
        { status: 404 }
      )
    }

    // Capturer l'état avant modification
    const previousState = { ...link }

    // Mettre à jour le lien
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        ...updates,
        lastModifiedBy: userId,
        updatedAt: new Date()
      }
    })

    // Enregistrer dans l'historique
    await recordLinkHistory(
      linkId,
      teamId!,
      userId!,
      'update',
      updates,
      { previousState }
    )

    // Logger l'action
    await logTeamAction(
      teamId!,
      userId!,
      'link_updated',
      linkId,
      {
        changes: Object.keys(updates),
        linkTitle: updatedLink.title
      },
      'info',
      request
    )

    return NextResponse.json({
      message: 'Lien mis à jour avec succès',
      link: updatedLink
    })
  } catch (error) {
    console.error('Erreur mise à jour lien:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la mise à jour du lien' },
      { status: 500 }
    )
  }
}

// DELETE: Retirer un lien du partage équipe
export async function DELETE(request: Request) {
  try {
    const { authorized, userId, teamId, error } = await requireTeamPermission(TeamAction.SHARE_LINK)
    if (!authorized) return error

    const { searchParams } = new URL(request.url)
    const linkId = searchParams.get('linkId')

    if (!linkId) {
      return NextResponse.json(
        { error: 'ID du lien requis' },
        { status: 400 }
      )
    }

    // Vérifier que le lien est partagé et que l'utilisateur est le propriétaire original
    const link = await prisma.link.findFirst({
      where: {
        id: linkId,
        teamId: teamId,
        teamShared: true,
        OR: [
          { userId: userId },
          { originalOwnerId: userId }
        ]
      }
    })

    if (!link) {
      return NextResponse.json(
        { error: 'Lien non trouvé ou non autorisé' },
        { status: 404 }
      )
    }

    // Retirer le lien du partage
    const updatedLink = await prisma.link.update({
      where: { id: linkId },
      data: {
        teamShared: false,
        teamId: null,
        lastModifiedBy: userId
      }
    })

    // Enregistrer dans l'historique
    await recordLinkHistory(
      linkId,
      teamId!,
      userId!,
      'unshare',
      { teamShared: false },
      { previousState: { teamShared: true, teamId } }
    )

    // Logger l'action
    await logTeamAction(
      teamId!,
      userId!,
      'link_unshared',
      linkId,
      {
        linkTitle: updatedLink.title,
        linkSlug: updatedLink.slug
      },
      'warning',
      request
    )

    return NextResponse.json({
      message: 'Lien retiré du partage équipe',
      link: updatedLink
    })
  } catch (error) {
    console.error('Erreur retrait partage:', error)
    return NextResponse.json(
      { error: 'Erreur lors du retrait du partage' },
      { status: 500 }
    )
  }
}