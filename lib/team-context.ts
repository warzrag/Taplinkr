import { prisma } from '@/lib/prisma'

/**
 * Ce qu'il faut savoir d'une personne pour decider ce qu'elle voit.
 *
 * Trois informations, toujours lues ensemble : son equipe, son role dans cette
 * equipe, et le reglage d'acces exclusif de l'equipe. Les separer revenait a
 * oublier le troisieme dans une route sur deux, et l'acces exclusif n'aurait
 * ete applique qu'a moitie - ce qui ne vaut pas mieux que pas du tout.
 */
export interface ContexteEquipe {
  teamId: string | null
  teamRole: string | null
  restrictToAssigned: boolean
}

export async function chargerContexteEquipe(userId: string): Promise<ContexteEquipe> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      teamId: true,
      teamRole: true,
      team: { select: { restrictToAssignedLinks: true } },
    },
  })

  return {
    teamId: user?.teamId ?? null,
    teamRole: user?.teamRole ?? null,
    restrictToAssigned: Boolean(user?.team?.restrictToAssignedLinks),
  }
}
