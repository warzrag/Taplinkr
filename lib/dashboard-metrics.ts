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

/**
 * Construire un Intl.DateTimeFormat est couteux, de l'ordre de la centaine de
 * microsecondes. dateKeyInTimeZone etant appele une fois par clic et par
 * fenetre, cela representait environ 24 000 constructions par affichage du
 * dashboard, soit près de deux secondes et demie de calcul pur.
 *
 * Les formateurs sont donc conserves par fuseau. Un fuseau invalide reste
 * associe au formateur UTC, comme avant.
 */
const dateKeyFormatters = new Map<string, Intl.DateTimeFormat>()

function dateKeyFormatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = dateKeyFormatters.get(timeZone)
  if (cached) return cached

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone })
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
  }

  dateKeyFormatters.set(timeZone, formatter)
  return formatter
}

export function dateKeyInTimeZone(date: Date, timeZone: string) {
  const formatter = dateKeyFormatterFor(timeZone)

  const parts = formatter.formatToParts(date)
  const year = parts.find(part => part.type === 'year')?.value
  const month = parts.find(part => part.type === 'month')?.value
  const day = parts.find(part => part.type === 'day')?.value
  return `${year}-${month}-${day}`
}

const offsetFormatters = new Map<string, Intl.DateTimeFormat>()

function offsetFormatterFor(timeZone: string): Intl.DateTimeFormat {
  const cached = offsetFormatters.get(timeZone)
  if (cached) return cached

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hourCycle: 'h23',
  }
  let formatter: Intl.DateTimeFormat
  try {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone })
  } catch {
    formatter = new Intl.DateTimeFormat('en-US', { ...options, timeZone: 'UTC' })
  }
  offsetFormatters.set(timeZone, formatter)
  return formatter
}

/** Decalage du fuseau, en millisecondes, a un instant donne. */
function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = offsetFormatterFor(timeZone).formatToParts(date)
  const value = (type: string) => Number(parts.find(part => part.type === type)?.value)
  const asUtc = Date.UTC(
    value('year'), value('month') - 1, value('day'),
    value('hour') % 24, value('minute'), value('second'),
  )
  return asUtc - date.getTime()
}

/**
 * Premier instant du jour donne, dans le fuseau du compte.
 *
 * Permet de compter directement en base sur un intervalle, au lieu de relire
 * chaque enregistrement pour le ranger par cle de date.
 */
export function zonedDayStart(dateKey: string, timeZone: string): Date {
  const utcMidnight = new Date(`${dateKey}T00:00:00.000Z`).getTime()
  const offset = timeZoneOffsetMs(new Date(utcMidnight), timeZone)
  const candidate = new Date(utcMidnight - offset)

  // Autour d'un changement d'heure, le decalage a l'instant corrige peut
  // differer de celui de depart : on recalcule une fois.
  const corrected = timeZoneOffsetMs(candidate, timeZone)
  return corrected === offset ? candidate : new Date(utcMidnight - corrected)
}

/** Cle du lendemain, au format AAAA-MM-JJ. */
export function nextDateKey(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00.000Z`)
  date.setUTCDate(date.getUTCDate() + 1)
  return date.toISOString().slice(0, 10)
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
