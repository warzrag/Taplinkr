import { describe, expect, it } from 'vitest'

import {
  hasTeamActionPermission,
  TeamAction,
  TeamRole,
} from '../lib/team-roles'
import { getTeamLinkCreationFields, uniqueTeamMemberIds } from '../lib/team-links'

describe('team member permissions', () => {
  it('allows members to collaborate on links', () => {
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.VIEW_LINKS)).toBe(true)
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.CREATE_LINK)).toBe(true)
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.EDIT_LINK)).toBe(true)
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.SHARE_LINK)).toBe(true)
  })

  it('does not allow members to manage the team', () => {
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.INVITE_MEMBER)).toBe(false)
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.REMOVE_MEMBER)).toBe(false)
    expect(hasTeamActionPermission(TeamRole.MEMBER, TeamAction.DELETE_TEAM)).toBe(false)
  })

  it('denies unknown roles instead of throwing', () => {
    expect(hasTeamActionPermission('unknown', TeamAction.VIEW_LINKS)).toBe(false)
  })
})

describe('team link workspace', () => {
  it('shares new links with the creator team by default', () => {
    expect(getTeamLinkCreationFields('member-1', 'team-1')).toEqual({
      teamShared: true,
      teamId: 'team-1',
      originalOwnerId: 'member-1',
      assignedToUserId: 'member-1',
    })
  })

  it('keeps links personal when the creator has no team', () => {
    expect(getTeamLinkCreationFields('user-1', null).teamShared).toBe(false)
  })

  it('deduplicates team member ids while retaining the current user', () => {
    expect(uniqueTeamMemberIds('owner-1', ['member-1', 'owner-1', 'member-1']))
      .toEqual(['owner-1', 'member-1'])
  })
})
