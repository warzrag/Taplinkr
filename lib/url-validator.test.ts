import { describe, expect, it } from 'vitest'

import { normalizeHttpURL, validateURL } from './url-validator'

describe('normalizeHttpURL', () => {
  it('adds https to a bare destination', () => {
    expect(normalizeHttpURL('example.com/offre')).toBe('https://example.com/offre')
  })

  it('keeps an existing http(s) protocol', () => {
    expect(normalizeHttpURL('https://example.com')).toBe('https://example.com')
    expect(normalizeHttpURL('http://example.com')).toBe('http://example.com')
  })

  it('does not disguise unsafe protocols', () => {
    const unsafeUrl = normalizeHttpURL('javascript:alert(1)')
    expect(unsafeUrl).toBe('javascript:alert(1)')
    expect(validateURL(unsafeUrl)).toBe(false)
  })
})
