import { describe, expect, it } from 'vitest'

import { anonymizeVisitor, classifyClickHeaders } from '../lib/click-quality-core'

function headers(values: Record<string, string>) {
  return new Headers(values)
}

describe('click quality filtering', () => {
  it.each([
    'Twitterbot/1.0',
    'facebookexternalhit/1.1',
    'LinkedInBot/1.0',
    'TelegramBot (like TwitterBot)',
    'Discordbot/2.0',
  ])('filters social preview agent %s', userAgent => {
    expect(classifyClickHeaders(headers({ 'user-agent': userAgent }))).toBe('preview')
  })

  it.each([
    'curl/8.7.1',
    'python-requests/2.32',
    'Mozilla/5.0 HeadlessChrome/124.0',
    '',
  ])('filters automated agent %s', userAgent => {
    expect(classifyClickHeaders(headers({ 'user-agent': userAgent }))).toBe('bot')
  })

  it('filters browser prefetches', () => {
    expect(classifyClickHeaders(headers({
      'user-agent': 'Mozilla/5.0 Chrome/124.0 Safari/537.36',
      purpose: 'prefetch',
    }))).toBe('prefetch')
  })

  it('keeps real social in-app browsers', () => {
    expect(classifyClickHeaders(headers({
      'user-agent': 'Mozilla/5.0 (iPhone) AppleWebKit/605.1.15 Instagram 330.0.0',
    }))).toBeNull()
  })

  it('creates a stable anonymized visitor key without exposing the IP', () => {
    const requestHeaders = headers({
      'user-agent': 'Mozilla/5.0 (iPhone) Mobile/15E148 Safari/604.1',
      'accept-language': 'fr-FR,fr;q=0.9',
    })
    const first = anonymizeVisitor('203.0.113.42', requestHeaders)
    const second = anonymizeVisitor('203.0.113.42', requestHeaders)

    expect(first).toBe(second)
    expect(first).toHaveLength(64)
    expect(first).not.toContain('203.0.113.42')
  })
})
