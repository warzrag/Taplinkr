export function isValidTimeZone(value: string | null | undefined): value is string {
  if (!value || value.length > 64) return false

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: value }).format()
    return true
  } catch {
    return false
  }
}

export function readReportingTimeZone(analytics: string | null | undefined) {
  if (!analytics) return null

  try {
    const parsed = JSON.parse(analytics)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const timeZone = (parsed as Record<string, unknown>).dashboardTimeZone
    return typeof timeZone === 'string' && isValidTimeZone(timeZone) ? timeZone : null
  } catch {
    return null
  }
}

export function writeReportingTimeZone(analytics: string | null | undefined, timeZone: string) {
  let parsed: Record<string, unknown> = {}

  if (analytics) {
    try {
      const candidate = JSON.parse(analytics)
      if (candidate && typeof candidate === 'object' && !Array.isArray(candidate)) {
        parsed = candidate as Record<string, unknown>
      }
    } catch {
      // Preserve a usable analytics configuration even if legacy data is malformed.
    }
  }

  return JSON.stringify({ ...parsed, dashboardTimeZone: timeZone })
}
