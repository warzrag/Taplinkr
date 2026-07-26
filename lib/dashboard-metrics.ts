export type DashboardPeriod = 'today' | '7d' | '30d'

type ClickMetricEvent = {
  id: string
  linkId: string
  ip?: string | null
  sessionId?: string | null
  multiLinkId?: string | null
}

type FilteredMetricEvent = {
  reason: string
}

export function dashboardPeriodStart(period: DashboardPeriod, now = new Date()) {
  const start = new Date(now)
  if (period === 'today') {
    start.setUTCHours(0, 0, 0, 0)
    return start
  }

  start.setUTCDate(start.getUTCDate() - (period === '7d' ? 6 : 29))
  start.setUTCHours(0, 0, 0, 0)
  return start
}

export function calculateDashboardMetrics(input: {
  clicks: ClickMetricEvent[]
  filteredClicks: FilteredMetricEvent[]
  directLinkIds: Set<string>
}) {
  const pageViews = input.clicks.filter(click => !click.multiLinkId).length
  const visitsWithClick = new Set<string>()

  for (const click of input.clicks) {
    const isCompletedClick = Boolean(click.multiLinkId) || input.directLinkIds.has(click.linkId)
    if (!isCompletedClick) continue

    const visitorKey = click.sessionId || click.ip || click.id
    visitsWithClick.add(`${click.linkId}:${visitorKey}`)
  }

  const clickedVisits = visitsWithClick.size
  const clickThroughRate = pageViews > 0
    ? Math.min(100, Number(((clickedVisits / pageViews) * 100).toFixed(1)))
    : 0
  const botsFiltered = input.filteredClicks.filter(click =>
    click.reason === 'bot' || click.reason === 'preview' || click.reason === 'prefetch'
  ).length

  return {
    pageViews,
    visitsWithClick: clickedVisits,
    clickThroughRate,
    botsFiltered,
  }
}
