import { describe, expect, it } from 'vitest'

import {
  isValidTimeZone,
  readReportingTimeZone,
  writeReportingTimeZone,
} from '../lib/reporting-timezone'

describe('reporting timezone', () => {
  it('validates IANA timezones', () => {
    expect(isValidTimeZone('Europe/Paris')).toBe(true)
    expect(isValidTimeZone('America/New_York')).toBe(true)
    expect(isValidTimeZone('not-a-timezone')).toBe(false)
  })

  it('keeps the account timezone alongside existing analytics settings', () => {
    const stored = writeReportingTimeZone('{"metaPixelId":"123"}', 'Europe/Paris')
    expect(JSON.parse(stored)).toEqual({
      metaPixelId: '123',
      dashboardTimeZone: 'Europe/Paris',
    })
    expect(readReportingTimeZone(stored)).toBe('Europe/Paris')
  })
})
