import { describe, expect, it } from 'vitest'

import { createShortPublicSlug } from '../lib/public-slug'

describe('public direct-link slugs', () => {
  it('creates a short neutral slug that does not depend on an internal name', () => {
    const slug = createShortPublicSlug(new Uint8Array([0, 1, 2, 3, 4, 5, 6, 7]))

    expect(slug).toBe('abcdefgh')
    expect(slug).toMatch(/^[a-z2-9]{8}$/)
  })
})
