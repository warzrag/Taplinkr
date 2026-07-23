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

export function canDeleteLink(input: {
  actorUserId: string
  actorTeamId?: string | null
  actorTeamRole?: string | null
  linkUserId: string
  linkTeamId?: string | null
}) {
  if (input.linkUserId === input.actorUserId) return true

  return Boolean(
    input.actorTeamId &&
    input.linkTeamId === input.actorTeamId &&
    hasTeamActionPermission(input.actorTeamRole, TeamAction.DELETE_LINK),
  )
}
