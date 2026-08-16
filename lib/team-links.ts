import { hasTeamActionPermission, TeamAction } from './team-roles'

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
 * La liste des liens (/api/links/fast) renvoie les liens de l'utilisateur ET
 * ceux de son equipe. Sans ce controle, les routes d'ecriture n'acceptaient que
 * le proprietaire direct : un lien d'equipe s'affichait mais toute modification
 * repondait "Link not found".
 */
export function canViewLink(input: {
  actorUserId: string
  actorTeamId?: string | null
  actorTeamRole?: string | null
  linkUserId: string
  linkTeamId?: string | null
  /** Equipe du proprietaire du lien. Les liens anciens n'ont pas de teamId
   *  propre : la liste les expose via l'appartenance de leur proprietaire. */
  linkOwnerTeamId?: string | null
}) {
  if (input.linkUserId === input.actorUserId) return true

  const sameTeam = Boolean(
    input.actorTeamId &&
    (input.linkTeamId === input.actorTeamId || input.linkOwnerTeamId === input.actorTeamId),
  )

  return Boolean(
    sameTeam &&
    hasTeamActionPermission(input.actorTeamRole, TeamAction.VIEW_LINKS),
  )
}

export function canEditLink(input: {
  actorUserId: string
  actorTeamId?: string | null
  actorTeamRole?: string | null
  linkUserId: string
  linkTeamId?: string | null
  /** Equipe du proprietaire du lien. Les liens anciens n'ont pas de teamId
   *  propre : la liste les expose via l'appartenance de leur proprietaire. */
  linkOwnerTeamId?: string | null
}) {
  if (input.linkUserId === input.actorUserId) return true

  const sameTeam = Boolean(
    input.actorTeamId &&
    (input.linkTeamId === input.actorTeamId || input.linkOwnerTeamId === input.actorTeamId),
  )

  return Boolean(
    sameTeam &&
    hasTeamActionPermission(input.actorTeamRole, TeamAction.EDIT_LINK),
  )
}

export function canDeleteLink(input: {
  actorUserId: string
  actorTeamId?: string | null
  actorTeamRole?: string | null
  linkUserId: string
  linkTeamId?: string | null
  /** Equipe du proprietaire du lien. Les liens anciens n'ont pas de teamId
   *  propre : la liste les expose via l'appartenance de leur proprietaire. */
  linkOwnerTeamId?: string | null
}) {
  if (input.linkUserId === input.actorUserId) return true

  const sameTeam = Boolean(
    input.actorTeamId &&
    (input.linkTeamId === input.actorTeamId || input.linkOwnerTeamId === input.actorTeamId),
  )

  return Boolean(
    sameTeam &&
    hasTeamActionPermission(input.actorTeamRole, TeamAction.DELETE_LINK),
  )
}
