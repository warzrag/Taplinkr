import { describe, expect, it } from 'vitest'

import { InvalidCustomDomainError, normalizeCustomDomain } from './domain-utils'

describe('custom-domain normalization', () => {
  it('normalizes a plain hostname and strips protocol, path and port', () => {
    expect(normalizeCustomDomain(' HTTPS://Links.Example.com:443/path ')).toBe('links.example.com')
  })

  it('accepts internationalized domain names as ASCII', () => {
    expect(normalizeCustomDomain('créatrice.fr')).toBe('xn--cratrice-c1a.fr')
  })

  it.each([
    'localhost',
    '127.0.0.1',
    'taplinkr.com',
    'www.taplinkr.com',
    'preview.vercel.app',
    'not a domain',
  ])('rejects reserved or invalid host %s', value => {
    expect(() => normalizeCustomDomain(value)).toThrow(InvalidCustomDomainError)
  })
})
