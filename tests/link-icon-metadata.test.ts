import { describe, expect, it } from 'vitest'
import {
  detectKnownPlatform,
  extractIconCandidates,
  isPrivateAddress,
  normalizeMetadataUrl,
} from '../lib/link-icon-metadata'

describe('link icon metadata', () => {
  it('recognizes common creator platforms without matching lookalike domains', () => {
    expect(detectKnownPlatform('www.instagram.com')?.name).toBe('Instagram')
    expect(detectKnownPlatform('onlyfans.com')?.icon).toMatch(/^data:image\/svg\+xml,/)
    expect(detectKnownPlatform('github.com')?.icon).toMatch(/^data:image\/svg\+xml,/)
    expect(detectKnownPlatform('youtu.be')?.name).toBe('YouTube')
    expect(detectKnownPlatform('www.youtube.com')?.icon).toMatch(/^data:image\/svg\+xml,/)
    expect(detectKnownPlatform('tiktok.com')?.icon).toMatch(/^data:image\/svg\+xml,/)
    expect(detectKnownPlatform('x.com')?.icon).toMatch(/^data:image\/svg\+xml,/)
    expect(detectKnownPlatform('instagram.com.evil.test')).toBeNull()
  })

  it('normalizes web addresses and rejects unsupported schemes', () => {
    expect(normalizeMetadataUrl('example.com/profile')?.href).toBe('https://example.com/profile')
    expect(normalizeMetadataUrl('javascript:alert(1)')).toBeNull()
    expect(normalizeMetadataUrl('https://example.com:8080/admin')).toBeNull()
  })

  it('blocks local and private network addresses', () => {
    expect(isPrivateAddress('127.0.0.1')).toBe(true)
    expect(isPrivateAddress('10.2.3.4')).toBe(true)
    expect(isPrivateAddress('192.168.1.2')).toBe(true)
    expect(isPrivateAddress('::1')).toBe(true)
    expect(isPrivateAddress('8.8.8.8')).toBe(false)
  })

  it('prefers declared icons and keeps Open Graph as a fallback', () => {
    const candidates = extractIconCandidates(
      '<link rel="apple-touch-icon" href="/touch.png"><meta property="og:image" content="/share.jpg">',
      new URL('https://example.com/profile'),
    )

    expect(candidates[0]).toMatchObject({ source: 'favicon' })
    expect(candidates[0].url.href).toBe('https://example.com/touch.png')
    expect(candidates[1]).toMatchObject({ source: 'open-graph' })
    expect(candidates.at(-1)?.url.href).toBe('https://example.com/favicon.ico')
  })
})
