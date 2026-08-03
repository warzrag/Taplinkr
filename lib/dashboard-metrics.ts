export type DashboardPeriod = 'today' | '7d' | '30d'

type ClickMetricEvent = {
  id: string
  linkId: string
  createdAt?: Date
  ip?: string | null
  sessionId?: string | null
  multiLinkId?: string | null
}

type FilteredMetricEvent = {
  reason: string
}

export function dateKeyInTimeZone(date: Date, timeZone: string) {
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  }

  const parts = formatter.formatToParts(date)
  const year = parts.find(part => part.type === 'year')?.value
  const month = parts.find(part => part.type === 'month')?.value
  const day = parts.find(part => part.type === 'day')?.value
  return `${year}-${month}-${day}`
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
  const uniqueVisitors = new Set<string>()
  let realClicks = 0

  for (const click of input.clicks) {
    const visitorKey = click.sessionId || click.ip || click.id
    uniqueVisitors.add(visitorKey)

    const isCompletedClick = Boolean(click.multiLinkId) || input.directLinkIds.has(click.linkId)
    if (!isCompletedClick) continue

    realClicks += 1
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
    realClicks,
    uniqueVisitors: uniqueVisitors.size,
    pageViews,
    visitsWithClick: clickedVisits,
    clickThroughRate,
    botsFiltered,
  }
}

export function calculateHourlyClicks(input: {
  now: Date
  timeZone: string
  clicks: ClickMetricEvent[]
  directLinkIds: Set<string>
}) {
  const today = dateKeyInTimeZone(input.now, input.timeZone)
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: input.timeZone,
      hour: '2-digit',
      hourCycle: 'h23',
    })
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'UTC',
      hour: '2-digit',
      hourCycle: 'h23',
    })
  }

  const hours = Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0 }))
  for (const click of input.clicks) {
    if (!click.createdAt || dateKeyInTimeZone(click.createdAt, input.timeZone) !== today) continue
    const isCompletedClick = Boolean(click.multiLinkId) || input.directLinkIds.has(click.linkId)
    if (!isCompletedClick) continue
    const hour = Number(formatter.format(click.createdAt))
    if (Number.isInteger(hour) && hours[hour]) hours[hour].clicks += 1
  }

  return hours
}

export function dashboardDateKeys(period: DashboardPeriod, now: Date, timeZone: string, dayOffset = 0) {
  const [year, month, day] = dateKeyInTimeZone(now, timeZone).split('-').map(Number)
  const currentDay = new Date(Date.UTC(year, month - 1, day))
  currentDay.setUTCDate(currentDay.getUTCDate() - dayOffset)
  const numberOfDays = period === 'today' ? 1 : period === '7d' ? 7 : 30

  return Array.from({ length: numberOfDays }, (_, index) => {
    const date = new Date(currentDay)
    date.setUTCDate(currentDay.getUTCDate() - (numberOfDays - index - 1))
    return date.toISOString().slice(0, 10)
  })
}

export function calculateDailyLinkClicks(input: {
  period: DashboardPeriod
  now: Date
  timeZone: string
  clicks: ClickMetricEvent[]
  links: Array<{
    id: string
    name: string
    slug: string
    isDirect: boolean
  }>
}) {
  const dateKeys = dashboardDateKeys(input.period, input.now, input.timeZone)
  const visibleDates = new Set(dateKeys)
  const directLinkIds = new Set(input.links.filter(link => link.isDirect).map(link => link.id))
  const counts = new Map(dateKeys.map(date => [date, new Map<string, number>()]))

  for (const click of input.clicks) {
    if (!click.createdAt) continue
    const isCompletedClick = Boolean(click.multiLinkId) || directLinkIds.has(click.linkId)
    if (!isCompletedClick) continue

    const date = dateKeyInTimeZone(click.createdAt, input.timeZone)
    if (!visibleDates.has(date)) continue
    const dailyCounts = counts.get(date)
    if (!dailyCounts) continue
    dailyCounts.set(click.linkId, (dailyCounts.get(click.linkId) || 0) + 1)
  }

  return {
    links: input.links.map(({ id, name, slug }) => ({ id, name, slug })),
    dailyClicks: dateKeys.map(date => {
      const dailyCounts = counts.get(date) || new Map<string, number>()
      const clicks = Object.fromEntries(input.links.map(link => [link.id, dailyCounts.get(link.id) || 0]))
      return {
        date,
        clicks,
        total: Object.values(clicks).reduce((sum, value) => sum + value, 0),
      }
    }),
  }
}
