import { isIP } from 'node:net'
import { lookup } from 'node:dns/promises'

export type LinkIconSource = 'platform' | 'favicon' | 'open-graph' | 'fallback'

export interface LinkIconMetadata {
  icon: string | null
  source: LinkIconSource | null
  siteName: string | null
}

const MAX_HTML_BYTES = 512 * 1024
const MAX_IMAGE_BYTES = 2 * 1024 * 1024
const REQUEST_TIMEOUT_MS = 5_000

const PLATFORM_HOSTS: Array<{ pattern: RegExp; name: string; home: string }> = [
  { pattern: /(^|\.)instagram\.com$/i, name: 'Instagram', home: 'https://www.instagram.com/' },
  { pattern: /(^|\.)tiktok\.com$/i, name: 'TikTok', home: 'https://www.tiktok.com/' },
  { pattern: /(^|\.)youtube\.com$|(^|\.)youtu\.be$/i, name: 'YouTube', home: 'https://www.youtube.com/' },
  { pattern: /(^|\.)twitter\.com$|(^|\.)x\.com$/i, name: 'X', home: 'https://x.com/' },
  { pattern: /(^|\.)telegram\.me$|(^|\.)t\.me$/i, name: 'Telegram', home: 'https://telegram.org/' },
  { pattern: /(^|\.)spotify\.com$/i, name: 'Spotify', home: 'https://www.spotify.com/' },
  { pattern: /(^|\.)onlyfans\.com$/i, name: 'OnlyFans', home: 'https://onlyfans.com/' },
  { pattern: /(^|\.)twitch\.tv$/i, name: 'Twitch', home: 'https://www.twitch.tv/' },
  { pattern: /(^|\.)discord\.(com|gg)$/i, name: 'Discord', home: 'https://discord.com/' },
  { pattern: /(^|\.)snapchat\.com$/i, name: 'Snapchat', home: 'https://www.snapchat.com/' },
  { pattern: /(^|\.)reddit\.com$/i, name: 'Reddit', home: 'https://www.reddit.com/' },
  { pattern: /(^|\.)facebook\.com$/i, name: 'Facebook', home: 'https://www.facebook.com/' },
  { pattern: /(^|\.)patreon\.com$/i, name: 'Patreon', home: 'https://www.patreon.com/' },
]

export function detectKnownPlatform(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, '')
  return PLATFORM_HOSTS.find(platform => platform.pattern.test(normalized)) || null
}

export function normalizeMetadataUrl(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    if (url.port && !['80', '443'].includes(url.port)) return null
    url.username = ''
    url.password = ''
    return url
  } catch {
    return null
  }
}

function isPrivateIpv4(address: string) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some(part => !Number.isInteger(part) || part < 0 || part > 255)) return true
  const [a, b] = parts
  return (
    a === 0 || a === 10 || a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    a >= 224
  )
}

function isPrivateIpv6(address: string) {
  const normalized = address.toLowerCase().split('%')[0]
  return (
    normalized === '::' || normalized === '::1' ||
    normalized.startsWith('fc') || normalized.startsWith('fd') ||
    /^fe[89ab]/.test(normalized) ||
    normalized.startsWith('::ffff:127.') ||
    normalized.startsWith('::ffff:10.') ||
    normalized.startsWith('::ffff:192.168.') ||
    /^::ffff:172\.(1[6-9]|2\d|3[01])\./.test(normalized)
  )
}

export function isPrivateAddress(address: string) {
  const version = isIP(address)
  if (version === 4) return isPrivateIpv4(address)
  if (version === 6) return isPrivateIpv6(address)
  return true
}

export async function assertPublicUrl(url: URL) {
  if (!['http:', 'https:'].includes(url.protocol) || (url.port && !['80', '443'].includes(url.port))) {
    throw new Error('This destination is not supported')
  }
  const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
  if (!hostname || hostname === 'localhost' || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new Error('Private destinations are not supported')
  }

  if (isIP(hostname)) {
    if (isPrivateAddress(hostname)) throw new Error('Private destinations are not supported')
    return
  }

  const addresses = await lookup(hostname, { all: true, verbatim: true })
  if (!addresses.length || addresses.some(({ address }) => isPrivateAddress(address))) {
    throw new Error('Private destinations are not supported')
  }
}

async function fetchPublic(url: URL, accept: string, redirects = 0): Promise<Response> {
  if (redirects > 3) throw new Error('Too many redirects')
  await assertPublicUrl(url)

  const response = await fetch(url, {
    redirect: 'manual',
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    headers: {
      Accept: accept,
      'User-Agent': 'Taplinkr-Link-Preview/1.0 (+https://www.taplinkr.com)',
    },
  })

  if (response.status >= 300 && response.status < 400) {
    const location = response.headers.get('location')
    if (!location) throw new Error('Invalid redirect')
    return fetchPublic(new URL(location, url), accept, redirects + 1)
  }

  return response
}

async function readLimited(response: Response, maxBytes: number) {
  const declaredSize = Number(response.headers.get('content-length') || 0)
  if (declaredSize > maxBytes) throw new Error('Remote file is too large')
  if (!response.body) return Buffer.alloc(0)

  const reader = response.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      total += value.byteLength
      if (total > maxBytes) throw new Error('Remote file is too large')
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }

  return Buffer.concat(chunks.map(chunk => Buffer.from(chunk)))
}

function attribute(tag: string, name: string) {
  const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i'))
  return match?.[1] || match?.[2] || match?.[3] || null
}

export function extractIconCandidates(html: string, pageUrl: URL) {
  const candidates: Array<{ url: URL; source: LinkIconSource }> = []
  const linkTags = html.match(/<link\b[^>]*>/gi) || []

  for (const tag of linkTags) {
    const rel = attribute(tag, 'rel')?.toLowerCase() || ''
    const href = attribute(tag, 'href')
    if (!href || !rel.split(/\s+/).some(value => ['icon', 'shortcut', 'apple-touch-icon', 'mask-icon'].includes(value))) continue
    try {
      candidates.push({ url: new URL(href, pageUrl), source: 'favicon' })
    } catch {}
  }

  const metaTags = html.match(/<meta\b[^>]*>/gi) || []
  for (const tag of metaTags) {
    const property = (attribute(tag, 'property') || attribute(tag, 'name') || '').toLowerCase()
    const content = attribute(tag, 'content')
    if (!content || !['og:logo', 'twitter:image', 'og:image'].includes(property)) continue
    try {
      candidates.push({ url: new URL(content, pageUrl), source: 'open-graph' })
    } catch {}
  }

  candidates.push({ url: new URL('/favicon.ico', pageUrl.origin), source: 'fallback' })
  return candidates.filter(({ url }) => ['http:', 'https:'].includes(url.protocol))
}

function extractSiteName(html: string, fallback: string) {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || []
  for (const tag of metaTags) {
    const property = (attribute(tag, 'property') || attribute(tag, 'name') || '').toLowerCase()
    if (property !== 'og:site_name') continue
    const content = attribute(tag, 'content')?.trim()
    if (content) return content.slice(0, 80)
  }
  return fallback
}

async function imageAsDataUri(url: URL) {
  const response = await fetchPublic(url, 'image/avif,image/webp,image/png,image/svg+xml,image/*;q=0.8,*/*;q=0.1')
  if (!response.ok) throw new Error('Unable to fetch icon')

  const contentType = (response.headers.get('content-type') || '').split(';')[0].toLowerCase()
  if (!contentType.startsWith('image/')) throw new Error('Remote icon is not an image')

  const input = await readLimited(response, MAX_IMAGE_BYTES)
  if (!input.length) throw new Error('Remote icon is empty')

  const sharp = (await import('sharp')).default
  const output = await sharp(input, { animated: false, limitInputPixels: 16_000_000 })
    .resize(96, 96, { fit: 'contain', withoutEnlargement: true })
    .webp({ quality: 86 })
    .toBuffer()

  return `data:image/webp;base64,${output.toString('base64')}`
}

export async function resolveLinkIcon(value: string): Promise<LinkIconMetadata> {
  const requestedUrl = normalizeMetadataUrl(value)
  if (!requestedUrl) throw new Error('Enter a valid web address')

  const platform = detectKnownPlatform(requestedUrl.hostname)
  const metadataUrl = platform ? new URL(platform.home) : requestedUrl
  const response = await fetchPublic(metadataUrl, 'text/html,application/xhtml+xml;q=0.9,*/*;q=0.2')
  if (!response.ok) throw new Error('Unable to read this website')

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
    throw new Error('This destination does not provide a page icon')
  }

  const html = (await readLimited(response, MAX_HTML_BYTES)).toString('utf8')
  const candidates = extractIconCandidates(html, metadataUrl)

  for (const candidate of candidates.slice(0, 8)) {
    try {
      const icon = await imageAsDataUri(candidate.url)
      return {
        icon,
        source: platform ? 'platform' : candidate.source,
        siteName: platform?.name || extractSiteName(html, requestedUrl.hostname.replace(/^www\./, '')),
      }
    } catch {
      // Try the next icon candidate. Broken favicons are common.
    }
  }

  return {
    icon: null,
    source: null,
    siteName: platform?.name || extractSiteName(html, requestedUrl.hostname.replace(/^www\./, '')),
  }
}
