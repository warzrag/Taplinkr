import { beforeEach, describe, expect, it, vi } from 'vitest'

const { revalidatePath, revalidateTag } = vi.hoisted(() => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath,
  revalidateTag,
}))

import {
  invalidatePublicLinkCache,
  PUBLIC_LINK_CACHE_SECONDS,
  PUBLIC_LINK_CACHE_TAG,
} from '../lib/public-link-cache'

describe('public link cache', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps resolved public links warm for one hour', () => {
    expect(PUBLIC_LINK_CACHE_SECONDS).toBe(3600)
  })

  it('invalidates cached data and every changed public path', () => {
    invalidatePublicLinkCache('first-link', 'second link', 'first-link', null)

    expect(revalidateTag).toHaveBeenCalledOnce()
    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_LINK_CACHE_TAG)
    expect(revalidatePath).toHaveBeenCalledTimes(2)
    expect(revalidatePath).toHaveBeenNthCalledWith(1, '/first-link', 'page')
    expect(revalidatePath).toHaveBeenNthCalledWith(2, '/second%20link', 'page')
  })

  it('can purge cached data without a known slug', () => {
    invalidatePublicLinkCache()

    expect(revalidateTag).toHaveBeenCalledWith(PUBLIC_LINK_CACHE_TAG)
    expect(revalidatePath).not.toHaveBeenCalled()
  })
})
