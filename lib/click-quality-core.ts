import { createHash } from 'crypto'

export type ClickFilterReason =
  | 'bot'
  | 'preview'
  | 'prefetch'
  | 'duplicate'
  | 'burst'

export type ClickHeaderReader = Pick<Headers, 'get'>

const PREVIEW_USER_AGENT =
  /facebookexternalhit|facebot|twitterbot|linkedinbot|slackbot|discordbot|telegrambot|whatsapp|pinterestbot|skypeuripreview|bingpreview|google-inspectiontool|tiktokspider|bytespider|snapchat|embedly|iframely/i

const AUTOMATION_USER_AGENT =
  /headlesschrome|(?:^|[\s;/_(.-])(bot|crawler|spider|scraper|slurp|headless|phantomjs|selenium|playwright|puppeteer)(?:$|[\s;/_).+-])|curl\/|wget\/|python-requests|python-urllib|go-http-client|java\/|libwww-perl|postmanruntime|axios\//i

export function classifyClickHeaders(headers: ClickHeaderReader): ClickFilterReason | null {
  const userAgent = (headers.get('user-agent') || '').trim()
  const purpose = [
    headers.get('purpose'),
    headers.get('sec-purpose'),
    headers.get('x-purpose'),
    headers.get('x-moz'),
  ].filter(Boolean).join(' ')

  if (/prefetch|prerender/i.test(purpose)) return 'prefetch'
  if (!userAgent) return 'bot'
  if (PREVIEW_USER_AGENT.test(userAgent)) return 'preview'
  if (AUTOMATION_USER_AGENT.test(userAgent)) return 'bot'
  return null
}

export function anonymizeVisitor(ip: string, headers: ClickHeaderReader): string {
  const language = (headers.get('accept-language') || '').split(',')[0].trim().toLowerCase()
  const userAgent = headers.get('user-agent') || ''
  const platform = /android/i.test(userAgent)
    ? 'android'
    : /iphone|ipad|ipod/i.test(userAgent)
      ? 'ios'
      : /mobile/i.test(userAgent)
        ? 'mobile'
        : 'desktop'
  const secret = process.env.CLICK_FINGERPRINT_SECRET
    || process.env.NEXTAUTH_SECRET
    || 'taplinkr-click-quality'

  return createHash('sha256')
    .update(`${secret}|${ip}|${language}|${platform}`)
    .digest('hex')
}
