import { describe, expect, it } from 'vitest'

import { calculateDashboardMetrics, dashboardPeriodStart } from '../lib/dashboard-metrics'

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
      pageViews: 3,
      visitsWithClick: 2,
      clickThroughRate: 66.7,
      botsFiltered: 3,
    })
  })

  it('calculates inclusive UTC periods', () => {
    const now = new Date('2026-07-26T15:30:00.000Z')
    expect(dashboardPeriodStart('today', now).toISOString()).toBe('2026-07-26T00:00:00.000Z')
    expect(dashboardPeriodStart('7d', now).toISOString()).toBe('2026-07-20T00:00:00.000Z')
    expect(dashboardPeriodStart('30d', now).toISOString()).toBe('2026-06-27T00:00:00.000Z')
  })
})
