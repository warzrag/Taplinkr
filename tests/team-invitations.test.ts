import { describe, expect, it } from 'vitest'

import {
  buildTeamInviteUrl,
  normalizeTeamInviteEmail,
} from '../lib/team-invitations'

describe('team invitations', () => {
  it('normalizes invitation email addresses', () => {
    expect(normalizeTeamInviteEmail('  Partner@Example.COM ')).toBe('partner@example.com')
  })

  it('builds the canonical join URL without duplicate slashes', () => {
    expect(buildTeamInviteUrl('abc/123', 'https://www.taplinkr.com/'))
      .toBe('https://www.taplinkr.com/teams/join/abc%2F123')
  })
})
