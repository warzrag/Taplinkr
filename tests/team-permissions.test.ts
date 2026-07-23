import { describe, expect, it } from 'vitest'

import {
  hasTeamActionPermission,
  TeamAction,
  TeamRole,
} from '../lib/team-roles'

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
