import { canEditLink } from '@/lib/team-links'
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { invalidatePublicLinkCache } from '@/lib/public-link-cache'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { linkIds } = body // Array d'IDs dans le nouvel ordre

    if (!Array.isArray(linkIds)) {
      return NextResponse.json({ error: 'linkIds must be an array' }, { status: 400 })
    }

    // La liste affiche aussi les liens des coequipiers : reordonner doit donc
    // les accepter. Sans cela, glisser un lien d equipe echouait.
    const [links, currentUser] = await Promise.all([
      prisma.link.findMany({ where: { id: { in: linkIds } } }),
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { teamId: true, teamRole: true },
      }),
    ])

    if (links.length !== linkIds.length) {
      return NextResponse.json({ error: 'Some links do not exist' }, { status: 404 })
    }

    // Les equipes des proprietaires sont lues en une fois plutot qu une requete
    // par lien.
    const autresProprietaires = [...new Set(
      links.map(link => link.userId).filter(id => id !== session.user.id)
    )]
    const equipeParProprietaire = new Map<string, string | null>(
      autresProprietaires.length
        ? (await prisma.user.findMany({
            where: { id: { in: autresProprietaires } },
            select: { id: true, teamId: true },
          })).map((u: any) => [String(u.id), u.teamId ?? null])
        : []
    )

    const interdit = links.find(link => !canEditLink({
      actorUserId: session.user.id,
      actorTeamId: currentUser?.teamId,
      actorTeamRole: currentUser?.teamRole,
      linkUserId: link.userId,
      linkTeamId: link.teamId,
      linkOwnerTeamId: equipeParProprietaire.get(link.userId),
    }))

    if (interdit) {
      return NextResponse.json({ error: 'You do not have permission to reorder these links' }, { status: 403 })
    }

    // Mettre à jour l'ordre de chaque lien
    const updatePromises = linkIds.map((linkId, index) =>
      prisma.link.update({
        where: { id: linkId },
        data: { order: index }
      })
    )

    await Promise.all(updatePromises)

    invalidatePublicLinkCache(...links.map(link => link.slug))
    return NextResponse.json({ message: 'Order updated' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'ordre:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
