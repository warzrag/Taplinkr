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
