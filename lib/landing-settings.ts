import { normalizeHttpURL, validateURL } from './url-validator'

export interface GeoRedirectRule {
  countries: string[]
  url: string
}

export interface LandingSettings {
  version: 1
  visitorLocationBadge: boolean
  locationBadgeTemplate: string
  countdown: {
    enabled: boolean
    label: string
    endAt: string
  }
  geoFilter: {
    enabled: boolean
    mode: 'allow' | 'block'
    countries: string[]
  }
  geoRedirects: GeoRedirectRule[]
  inAppBrowserWarning: boolean
  ageGateEnabled: boolean
  tracking: {
    metaPixelId: string
    googleAnalyticsId: string
    googleAdsId: string
  }
}

export const DEFAULT_LANDING_SETTINGS: LandingSettings = {
  version: 1,
  visitorLocationBadge: false,
  locationBadgeTemplate: "I'm in {city}, {country}",
  countdown: { enabled: false, label: 'Offer ends in', endAt: '' },
  geoFilter: { enabled: false, mode: 'block', countries: [] },
  geoRedirects: [],
  inAppBrowserWarning: true,
  ageGateEnabled: false,
  tracking: { metaPixelId: '', googleAnalyticsId: '', googleAdsId: '' },
}

export function normalizeCountryCodes(value: unknown): string[] {
  const values = Array.isArray(value) ? value : String(value || '').split(',')
  return [...new Set(values.map(item => String(item).trim().toUpperCase()).filter(item => /^[A-Z]{2}$/.test(item)))]
}

export function parseLandingSettings(value?: string | null): LandingSettings {
  if (!value) return structuredClone(DEFAULT_LANDING_SETTINGS)
  try {
    const input = JSON.parse(value)
    if (!input || input.type !== 'landing-settings') return structuredClone(DEFAULT_LANDING_SETTINGS)
    return sanitizeLandingSettings(input)
  } catch {
    return structuredClone(DEFAULT_LANDING_SETTINGS)
  }
}

export function sanitizeLandingSettings(input: any): LandingSettings {
  const redirects = Array.isArray(input?.geoRedirects)
    ? input.geoRedirects.slice(0, 20).map((rule: any) => ({
        countries: normalizeCountryCodes(rule?.countries),
        url: normalizeHttpURL(String(rule?.url || '')),
      })).filter((rule: GeoRedirectRule) => rule.url && validateURL(rule.url))
    : []

  return {
    version: 1,
    visitorLocationBadge: Boolean(input?.visitorLocationBadge),
    locationBadgeTemplate: String(input?.locationBadgeTemplate || "I'm in {city}, {country}").trim().slice(0, 80),
    countdown: {
      enabled: Boolean(input?.countdown?.enabled),
      label: String(input?.countdown?.label || 'Offer ends in').trim().slice(0, 60),
      endAt: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(String(input?.countdown?.endAt || ''))
        ? String(input.countdown.endAt).slice(0, 30)
        : '',
    },
    geoFilter: {
      enabled: Boolean(input?.geoFilter?.enabled),
      mode: input?.geoFilter?.mode === 'allow' ? 'allow' : 'block',
      countries: normalizeCountryCodes(input?.geoFilter?.countries),
    },
    geoRedirects: redirects,
    inAppBrowserWarning: input?.inAppBrowserWarning !== false,
    ageGateEnabled: Boolean(input?.ageGateEnabled),
    tracking: {
      metaPixelId: /^\d{5,30}$/.test(String(input?.tracking?.metaPixelId || '').trim()) ? String(input.tracking.metaPixelId).trim() : '',
      googleAnalyticsId: /^G-[A-Z0-9]{4,20}$/i.test(String(input?.tracking?.googleAnalyticsId || '').trim()) ? String(input.tracking.googleAnalyticsId).trim().toUpperCase() : '',
      googleAdsId: /^AW-\d{5,20}$/i.test(String(input?.tracking?.googleAdsId || '').trim()) ? String(input.tracking.googleAdsId).trim().toUpperCase() : '',
    },
  }
}

export function serializeLandingSettings(input: unknown) {
  return JSON.stringify({ type: 'landing-settings', ...sanitizeLandingSettings(input) })
}
