import { describe, expect, it } from 'vitest'

import {
  calculateDailyLinkClicks,
  calculateDashboardMetrics,
  calculateHourlyClicks,
  dashboardDateKeys,
  dashboardPeriodStart,
} from '../lib/dashboard-metrics'

describe('dashboard metrics', () => {
  it('counts page views, deduplicated clicked visits, CTR, and bots', () => {
    const metrics = calculateDashboardMetrics({
      directLinkIds: new Set(['direct']),
      clicks: [
        { id: 'view-1', linkId: 'page', ip: 'visitor-a', multiLinkId: null },
        { id: 'click-1', linkId: 'page', ip: 'visitor-a', sessionId: 'session-a', multiLinkId: 'button-1' },
        { id: 'click-2', linkId: 'page', ip: 'visitor-a', sessionId: 'session-a', multiLinkId: 'button-2' },
        { id: 'view-2', linkId: 'page', ip: 'visitor-b', multiLinkId: null },
        { id: 'direct-1', linkId: 'direct', ip: 'visitor-c', multiLinkId: null },
      ],
      filteredClicks: [
        { reason: 'bot' },
        { reason: 'preview' },
        { reason: 'prefetch' },
        { reason: 'duplicate' },
        { reason: 'burst' },
      ],
    })

    expect(metrics).toEqual({
      realClicks: 3,
      uniqueVisitors: 4,
      pageViews: 3,
      visitsWithClick: 2,
      clickThroughRate: 66.7,
      botsFiltered: 3,
    })
  })

  it('groups completed clicks by local hour', () => {
    const hours = calculateHourlyClicks({
      now: new Date('2026-07-27T12:00:00.000Z'),
      timeZone: 'Europe/Paris',
      directLinkIds: new Set(['direct']),
      clicks: [
        { id: 'view', linkId: 'page', createdAt: new Date('2026-07-27T08:00:00.000Z') },
        { id: 'page-click', linkId: 'page', multiLinkId: 'button', createdAt: new Date('2026-07-27T08:10:00.000Z') },
        { id: 'direct-click', linkId: 'direct', createdAt: new Date('2026-07-27T09:15:00.000Z') },
      ],
    })

    expect(hours[10].clicks).toBe(1)
    expect(hours[11].clicks).toBe(1)
    expect(hours.reduce((sum, hour) => sum + hour.clicks, 0)).toBe(2)
  })

  it('calculates inclusive UTC periods', () => {
    const now = new Date('2026-07-26T15:30:00.000Z')
    expect(dashboardPeriodStart('today', now).toISOString()).toBe('2026-07-26T00:00:00.000Z')
    expect(dashboardPeriodStart('7d', now).toISOString()).toBe('2026-07-20T00:00:00.000Z')
    expect(dashboardPeriodStart('30d', now).toISOString()).toBe('2026-06-27T00:00:00.000Z')
  })

  it('builds every local calendar day for the selected period', () => {
    const now = new Date('2026-07-27T01:00:00.000Z')
    expect(dashboardDateKeys('today', now, 'America/Los_Angeles')).toEqual(['2026-07-26'])
    expect(dashboardDateKeys('7d', now, 'Europe/Paris')).toEqual([
      '2026-07-21',
      '2026-07-22',
      '2026-07-23',
      '2026-07-24',
      '2026-07-25',
      '2026-07-26',
      '2026-07-27',
    ])
  })

  it('counts completed clicks per day and per link without counting page views', () => {
    const result = calculateDailyLinkClicks({
      period: '7d',
      now: new Date('2026-07-27T12:00:00.000Z'),
      timeZone: 'Europe/Paris',
      links: [
        { id: 'page', name: 'My page', slug: 'page', isDirect: false },
        { id: 'direct', name: 'Campaign A', slug: 'abc123', isDirect: true },
      ],
      clicks: [
        { id: 'view', linkId: 'page', createdAt: new Date('2026-07-27T08:00:00.000Z'), multiLinkId: null },
        { id: 'button', linkId: 'page', createdAt: new Date('2026-07-27T08:01:00.000Z'), multiLinkId: 'button-1' },
        { id: 'direct', linkId: 'direct', createdAt: new Date('2026-07-26T22:30:00.000Z'), multiLinkId: null },
      ],
    })

    expect(result.dailyClicks.at(-1)).toEqual({
      date: '2026-07-27',
      clicks: { page: 1, direct: 1 },
      total: 2,
    })
  })
})
