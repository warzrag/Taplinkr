import { describe, expect, it } from 'vitest'
import { normalizeUsername, validateUsername } from '../lib/username'

describe('username validation', () => {
  it('normalizes case and whitespace', () => {
    expect(normalizeUsername('  Lea-Martin_7 ')).toBe('lea-martin_7')
  })

  it('accepts a valid username', () => {
    expect(validateUsername('lea-martin')).toEqual({ valid: true, username: 'lea-martin' })
  })

  it.each(['ab', 'avec espace', 'créatrice', 'a'.repeat(31)])('rejects invalid username %s', (username) => {
    expect(validateUsername(username).valid).toBe(false)
  })

  it.each(['admin', 'demo', 'pricing', 'cookies'])('rejects reserved username %s', (username) => {
    expect(validateUsername(username).valid).toBe(false)
  })
})
