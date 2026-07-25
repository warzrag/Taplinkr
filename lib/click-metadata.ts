import type { ClickAssessment } from './click-quality'
import { getLocationFromIP } from './geo-location-helper'
import { parseUserAgent } from './user-agent-parser'

type ClientMetadata = {
  screenResolution?: unknown
  language?: unknown
  timezone?: unknown
  sessionId?: unknown
}

function safeHeaderValue(value: string | null, maxLength: number) {
  if (!value) return null
  try {
    return decodeURIComponent(value).trim().slice(0, maxLength) || null
  } catch {
    return value.trim().slice(0, maxLength) || null
  }
}

function numberHeader(value: string | null) {
  if (!value) return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function countryName(countryCode: string | null) {
  if (!countryCode) return null
  try {
    return new Intl.DisplayNames(['en-US'], { type: 'region' }).of(countryCode.toUpperCase()) || countryCode
  } catch {
    return countryCode
  }
}

function clientString(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) || null : null
}

export async function buildClickMetadata(input: {
  assessment: ClickAssessment
  headers: Headers
  client?: ClientMetadata
}) {
  const { assessment, headers, client = {} } = input
  const parsed = parseUserAgent(assessment.userAgent)

  const vercelCountryCode = safeHeaderValue(headers.get('x-vercel-ip-country'), 2)
  const vercelCity = safeHeaderValue(headers.get('x-vercel-ip-city'), 128)
  const vercelRegion = safeHeaderValue(headers.get('x-vercel-ip-country-region'), 128)
  const vercelTimezone = safeHeaderValue(headers.get('x-vercel-ip-timezone'), 64)
  const vercelLatitude = numberHeader(headers.get('x-vercel-ip-latitude'))
  const vercelLongitude = numberHeader(headers.get('x-vercel-ip-longitude'))

  const location = vercelCountryCode
    ? {
        country: countryName(vercelCountryCode) || 'Unknown',
        city: vercelCity,
        region: vercelRegion,
        timezone: vercelTimezone,
        lat: vercelLatitude,
        lon: vercelLongitude,
      }
    : await getLocationFromIP(assessment.rawIp)

  const acceptedLanguage = headers.get('accept-language')?.split(',')[0]?.trim()

  return {
    ip: assessment.visitorHash,
    userAgent: assessment.userAgent.slice(0, 512),
    referer: assessment.referer,
    device: parsed.device.type,
    browser: parsed.browser.name,
    os: parsed.os.name,
    screenResolution: clientString(client.screenResolution, 32),
    language: clientString(client.language, 32) || safeHeaderValue(acceptedLanguage || null, 32),
    timezone: clientString(client.timezone, 64) || location.timezone || null,
    sessionId: clientString(client.sessionId, 128),
    country: location.country || 'Unknown',
    city: location.city || null,
    region: location.region || null,
    latitude: location.lat || null,
    longitude: location.lon || null,
  }
}
