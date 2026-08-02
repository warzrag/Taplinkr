import { describe, expect, it } from 'vitest'
import { parseLandingSettings, serializeLandingSettings } from '../lib/landing-settings'

describe('landing settings', () => {
  it('uses safe defaults for missing or legacy shield configuration', () => {
    expect(parseLandingSettings(null).inAppBrowserWarning).toBe(true)
    expect(parseLandingSettings('{"timer":3000}').geoRedirects).toEqual([])
  })

  it('normalizes country codes and validates tracking identifiers', () => {
    const serialized = serializeLandingSettings({
      visitorLocationBadge: true,
      geoFilter: { enabled: true, mode: 'allow', countries: ['us', 'FR', 'invalid'] },
      tracking: { metaPixelId: '1234567890', googleAnalyticsId: 'g-abcd1234', googleAdsId: 'aw-1234567' },
    })
    const settings = parseLandingSettings(serialized)

    expect(settings.geoFilter.countries).toEqual(['US', 'FR'])
    expect(settings.tracking).toEqual({
      metaPixelId: '1234567890',
      googleAnalyticsId: 'G-ABCD1234',
      googleAdsId: 'AW-1234567',
    })
  })

  it('drops unsafe redirect destinations', () => {
    const settings = parseLandingSettings(serializeLandingSettings({
      geoRedirects: [
        { countries: ['US'], url: 'https://example.com/us' },
        { countries: ['FR'], url: 'javascript:alert(1)' },
      ],
    }))

    expect(settings.geoRedirects).toEqual([{ countries: ['US'], url: 'https://example.com/us' }])
  })
})
