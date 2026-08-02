import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { resolveLinkIcon } from '@/lib/link-icon-metadata'
import { checkRateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

interface CacheEntry {
  expiresAt: number
  value: Awaited<ReturnType<typeof resolveLinkIcon>>
}

const globalCache = globalThis as typeof globalThis & {
  taplinkrLinkIconCache?: Map<string, CacheEntry>
}

const cache = globalCache.taplinkrLinkIconCache || new Map<string, CacheEntry>()
globalCache.taplinkrLinkIconCache = cache

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const rateLimit = checkRateLimit(`link-metadata:${session.user.id}`, {
      maxAttempts: 30,
      windowMs: 60 * 1_000,
      message: 'Too many icon checks. Wait a minute and try again.',
    })
    if (!rateLimit.success) {
      return NextResponse.json({ error: rateLimit.message }, { status: 429 })
    }

    const body = await request.json()
    const url = String(body?.url || '').trim()
    if (!url || url.length > 2_048) {
      return NextResponse.json({ error: 'Enter a valid web address' }, { status: 400 })
    }

    const cacheKey = url.toLowerCase()
    const cached = cache.get(cacheKey)
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json({ ...cached.value, cached: true })
    }

    const value = await resolveLinkIcon(url)
    cache.set(cacheKey, { value, expiresAt: Date.now() + 24 * 60 * 60 * 1_000 })

    if (cache.size > 250) {
      const oldestKey = cache.keys().next().value
      if (oldestKey) cache.delete(oldestKey)
    }

    return NextResponse.json(value)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to detect this website icon'
    const clientError = /valid|private|supported|provide/i.test(message)
    console.warn('Link metadata lookup failed:', message)
    return NextResponse.json({ error: message }, { status: clientError ? 400 : 502 })
  }
}
