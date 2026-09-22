import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireTeamPermission, TeamAction, logTeamAction } from '@/lib/team-permissions'
import { cache } from '@/lib/redis-cache'

/**
 * Reglages de l'equipe que le proprietaire peut changer.
 *
 * Pour l'instant un seul : l'acces exclusif, qui limite chaque membre aux
 * liens qui lui sont attribues.
 *
 * `EDIT_SETTINGS` n'appartient qu'au proprietaire et aux administrateurs. Un
 * membre restreint ne doit evidemment pas pouvoir lever sa propre restriction.
 */
export async function PATCH(request: Request) {
  try {
    const { authorized, userId, teamId, error } = await requireTeamPermission(TeamAction.EDIT_SETTINGS)
    if (!authorized) return error

    const body = await request.json().catch(() => null)
    const valeur = body?.restrictToAssignedLinks

    if (typeof valeur !== 'boolean') {
      return NextResponse.json(
        { error: 'restrictToAssignedLinks must be true or false' },
        { status: 400 },
      )
    }

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { restrictToAssignedLinks: valeur },
      select: { id: true, restrictToAssignedLinks: true },
    })

    // Les listes de liens sont mises en cache par personne. Sans cette purge,
    // un membre garderait jusqu'a trois secondes la vue complete apres
    // l'allumage - court, mais trompeur pendant une demonstration.
    const membres = await prisma.user.findMany({
      where: { teamId },
      select: { id: true },
    })
    await Promise.all(membres.map(membre => cache.del(`links:user:${membre.id}`)))

    logTeamAction(
      teamId!,
      userId!,
      'team_settings_updated',
      undefined,
      { restrictToAssignedLinks: valeur },
      'info',
      request,
    ).catch(() => {})

    return NextResponse.json({ team })
  } catch (error) {
    console.error('Erreur lors de la mise a jour des reglages d\'equipe:', error)
    return NextResponse.json({ error: 'Unable to update the team settings' }, { status: 500 })
  }
}
