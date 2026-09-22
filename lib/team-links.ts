import { hasTeamActionPermission, TeamAction, TeamRole } from './team-roles'

export function getTeamLinkCreationFields(userId: string, teamId?: string | null) {
  if (!teamId) {
    return {
      teamShared: false,
      teamId: null,
      originalOwnerId: null,
      assignedToUserId: null,
    }
  }

  return {
    teamShared: true,
    teamId,
    originalOwnerId: userId,
    assignedToUserId: userId,
  }
}

export function uniqueTeamMemberIds(currentUserId: string, memberIds: string[]): string[] {
  return [...new Set([currentUserId, ...memberIds].filter(Boolean))]
}

/**
 * Acces exclusif : chaque membre ne voit que le lien qui lui est attribue.
 *
 * Demande d'une agence qui fait travailler plusieurs assistantes sur le meme
 * compte. Sans ce reglage, toute personne ajoutee a l'equipe voit la totalite
 * des liens de l'equipe.
 *
 * Le reglage vit sur l'equipe (`Team.restrictToAssignedLinks`) et reste eteint
 * par defaut : l'allumer avant d'avoir attribue les liens viderait le tableau
 * de bord des membres, qui croiraient l'outil casse.
 *
 * Le proprietaire et les administrateurs gardent la vue complete. Ce sont eux
 * qui attribuent les liens et verifient le travail ; les restreindre rendrait
 * le reglage impossible a defaire.
 */
function estRestreint(input: {
  actorTeamRole?: string | null
  restrictToAssigned?: boolean | null
}) {
  if (!input.restrictToAssigned) return false
  return input.actorTeamRole !== TeamRole.OWNER && input.actorTeamRole !== TeamRole.ADMIN
}

/**
 * Le filtre Prisma des liens qu'un membre restreint a le droit de voir.
 *
 * Renvoie `null` quand la personne n'est pas restreinte : l'appelant garde
 * alors son filtre d'equipe habituel.
 *
 * Les listes et les controles unitaires doivent decrire exactement la meme
 * regle. Quand elles divergent, un lien s'affiche dans la liste mais toute
 * modification repond « Link not found » - le defaut deja rencontre avec les
 * liens d'equipe.
 */
export function filtreLiensAttribues(input: {
  actorUserId: string
  actorTeamRole?: string | null
  restrictToAssigned?: boolean | null
}) {
  if (!estRestreint(input)) return null

  return {
    OR: [
      { assignedToUserId: input.actorUserId },
      // Un lien qu'on a cree et que personne ne s'est vu attribuer reste le
      // sien : sinon un membre perdrait le lien qu'il vient de creer.
      { userId: input.actorUserId, assignedToUserId: null },
    ],
  }
}

export interface AccesLien {
  actorUserId: string
  actorTeamId?: string | null
  actorTeamRole?: string | null
  linkUserId: string
  linkTeamId?: string | null
  /** Equipe du proprietaire du lien. Les liens anciens n'ont pas de teamId
   *  propre : la liste les expose via l'appartenance de leur proprietaire. */
  linkOwnerTeamId?: string | null
  /** Membre a qui le lien est attribue, quand l'equipe est en acces exclusif. */
  linkAssignedToUserId?: string | null
  /** Reglage `Team.restrictToAssignedLinks` de l'equipe de la personne. */
  restrictToAssigned?: boolean | null
}

/**
 * La liste des liens (/api/links/fast) renvoie les liens de l'utilisateur ET
 * ceux de son equipe. Sans ce controle, les routes d'ecriture n'acceptaient que
 * le proprietaire direct : un lien d'equipe s'affichait mais toute modification
 * repondait « Link not found ».
 */
function acces(input: AccesLien, action: TeamAction) {
  if (estRestreint(input)) {
    // Meme regle que `filtreLiensAttribues`, exprimee sur un lien unique.
    const cible = input.linkAssignedToUserId || input.linkUserId
    if (cible !== input.actorUserId) return false
  }

  if (input.linkUserId === input.actorUserId) return true

  const sameTeam = Boolean(
    input.actorTeamId &&
    (input.linkTeamId === input.actorTeamId || input.linkOwnerTeamId === input.actorTeamId),
  )

  return Boolean(sameTeam && hasTeamActionPermission(input.actorTeamRole, action))
}

export function canViewLink(input: AccesLien) {
  return acces(input, TeamAction.VIEW_LINKS)
}

export function canEditLink(input: AccesLien) {
  return acces(input, TeamAction.EDIT_LINK)
}

export function canDeleteLink(input: AccesLien) {
  return acces(input, TeamAction.DELETE_LINK)
}
