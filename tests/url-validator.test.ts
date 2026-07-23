import { describe, expect, it } from 'vitest'
import { extractDomain, isFromDomain, sanitizeURL, validateURL, validateURLs } from '../lib/url-validator'

describe('URL validation', () => {
  it('accepts only HTTP(S) URLs without embedded credentials', () => {
    expect(validateURL('https://example.com/path')).toBe(true)
    expect(validateURL('http://localhost:3000')).toBe(true)
    expect(validateURL('javascript:alert(1)')).toBe(false)
    expect(validateURL('data:text/html,test')).toBe(false)
    expect(validateURL('https://user:password@example.com')).toBe(false)
  })

  it('normalizes and inspects valid URLs', () => {
    expect(sanitizeURL(' https://example.com/test ')).toBe('https://example.com/test')
    expect(extractDomain('https://www.example.com/test')).toBe('www.example.com')
    expect(isFromDomain('https://sub.example.com', 'example.com')).toBe(true)
    expect(isFromDomain('https://example.com.evil.test', 'example.com')).toBe(false)
  })

  it('reports invalid URLs in a collection', () => {
    expect(validateURLs(['https://example.com', 'file:///etc/passwd'])).toMatchObject({
      isValid: false,
      validCount: 1,
      invalidCount: 1,
    })
  })
})
