import { describe, expect, it } from 'vitest'

import { buildClickMetadata } from '../lib/click-metadata'
import type { ClickAssessment } from '../lib/click-quality'

const assessment: ClickAssessment = {
  counted: true,
  reason: null,
  visitorHash: 'anonymous-visitor',
  rawIp: '203.0.113.10',
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1 Instagram 320.0',
  referer: 'https://l.instagram.com/',
}

describe('click metadata', () => {
  it('captures device, browser, OS, location, language, and timezone', async () => {
    const headers = new Headers({
      'x-vercel-ip-country': 'US',
      'x-vercel-ip-city': 'New%20York',
      'x-vercel-ip-country-region': 'NY',
      'x-vercel-ip-timezone': 'America/New_York',
      'x-vercel-ip-latitude': '40.7128',
      'x-vercel-ip-longitude': '-74.0060',
      'accept-language': 'en-US,en;q=0.9',
    })

    const metadata = await buildClickMetadata({
      assessment,
      headers,
      client: { screenResolution: '1179x2556' },
    })

    expect(metadata).toMatchObject({
      ip: 'anonymous-visitor',
      browser: 'Instagram',
      os: 'iOS',
      device: 'mobile',
      country: 'United States',
      city: 'New York',
      region: 'NY',
      language: 'en-US',
      timezone: 'America/New_York',
      screenResolution: '1179x2556',
      latitude: 40.7128,
      longitude: -74.006,
    })
  })
})
