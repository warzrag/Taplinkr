import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createSignedToken, verifySignedToken } from '../lib/signed-token'

describe('signed tokens', () => {
  beforeEach(() => {
    process.env.NEXTAUTH_SECRET = 'test-secret-that-is-long-enough'
    vi.useRealTimers()
  })

  it('accepts a valid token for its intended purpose and subject', () => {
    const token = createSignedToken('password-access', 'link-1', Date.now() + 60_000)
    expect(verifySignedToken(token, 'password-access', 'link-1')).toBe(true)
    expect(verifySignedToken(token, 'password-access', 'link-2')).toBe(false)
  })

  it('rejects tampered, expired, and premature tokens', () => {
    const now = Date.now()
    const valid = createSignedToken('shield', 'link-1', now + 60_000)
    expect(verifySignedToken(`${valid}x`, 'shield', 'link-1')).toBe(false)

    const expired = createSignedToken('shield', 'link-1', now - 1)
    expect(verifySignedToken(expired, 'shield', 'link-1')).toBe(false)

    const premature = createSignedToken('shield', 'link-1', now + 60_000, now + 30_000)
    expect(verifySignedToken(premature, 'shield', 'link-1', { enforceNotBefore: true })).toBe(false)
  })
})
