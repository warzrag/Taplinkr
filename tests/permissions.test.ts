import { describe, expect, it } from 'vitest'

import {
  checkLimit,
  checkPermission,
  getUserPermissions,
} from '../lib/permissions'

describe('plan permissions', () => {
  it('falls back to the free plan when a stored plan is missing', () => {
    const permissions = getUserPermissions({
      role: 'user',
      plan: undefined as unknown as string,
    })

    expect(permissions.plan).toBe('free')
    expect(checkLimit(permissions, 'maxPages', 0)).toBe(true)
    expect(checkPermission(permissions, 'hasCustomDomain')).toBe(false)
  })

  it('uses the team owner plan when it is available', () => {
    const permissions = getUserPermissions({
      role: 'user',
      plan: 'free',
      teamOwner: {
        plan: 'premium',
      },
    })

    expect(permissions.plan).toBe('premium')
    expect(checkLimit(permissions, 'maxPages', 100)).toBe(true)
    expect(checkPermission(permissions, 'hasCustomDomain')).toBe(true)
  })
})
