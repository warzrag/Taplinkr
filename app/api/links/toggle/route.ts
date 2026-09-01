import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidatePublicLinkCache } from '@/lib/public-link-cache'
import { canEditLink } from '@/lib/team-links'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body
    try {
      body = await request.json()
    } catch (e) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }
    
    const { linkId, isActive } = body

    if (typeof linkId !== 'string' || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'linkId and isActive are required' }, { status: 400 })
    }

    // Le lien peut appartenir a un coequipier : la liste les affiche, il faut
    // donc les accepter ici aussi. Sans ce controle, activer ou desactiver le
    // lien d un membre de l equipe repondait "Link not found".
    const [existingLink, currentUser] = await Promise.all([
      prisma.link.findUnique({ where: { id: linkId } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { teamId: true, teamRole: true },
      }),
    ])

    if (!existingLink) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }

    const owner = existingLink.userId === session.user.id ? null : await prisma.user.findUnique({
      where: { id: existingLink.userId },
      select: { teamId: true },
    })

    if (!canEditLink({
      actorUserId: session.user.id,
      actorTeamId: currentUser?.teamId,
      actorTeamRole: currentUser?.teamRole,
      linkUserId: existingLink.userId,
      linkTeamId: existingLink.teamId,
      linkOwnerTeamId: owner?.teamId,
    })) {
      return NextResponse.json({
        error: 'You do not have permission to edit this link',
      }, { status: 403 })
    }

    const link = await prisma.link.update({
      where: { id: linkId },
      data: { isActive }
    })

    invalidatePublicLinkCache(existingLink.slug)
    return NextResponse.json(link)
  } catch (error) {
    console.error('Erreur lors du toggle du lien:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
