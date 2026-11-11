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

/*
 * Fuseau choisi par la personne elle-meme (reglage "Time zone" des stats).
 *
 * L'ancien champ dashboardTimeZone etait rempli une seule fois, tout seul,
 * pour toute l'equipe : souvent par un VA a l'autre bout du monde, et sans
 * moyen de le changer. Il n'est plus lu. Sans choix, on suit l'appareil.
 */
export function readChosenTimeZone(analytics: string | null | undefined) {
  if (!analytics) return null

  try {
    const parsed = JSON.parse(analytics)
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null
    const timeZone = (parsed as Record<string, unknown>).timeZone
    return typeof timeZone === 'string' && isValidTimeZone(timeZone) ? timeZone : null
  } catch {
    return null
  }
}

export function writeChosenTimeZone(analytics: string | null | undefined, timeZone: string | null) {
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

  const { timeZone: _previous, ...rest } = parsed
  return JSON.stringify(timeZone ? { ...rest, timeZone } : rest)
}

/** Fuseau des stats : le choix de la personne, sinon celui de son appareil, sinon UTC. */
export function resolveReportingTimeZone(analytics: string | null | undefined, deviceTimeZone: string | null | undefined) {
  const chosen = readChosenTimeZone(analytics)
  return {
    timeZone: chosen || (isValidTimeZone(deviceTimeZone) ? deviceTimeZone : 'UTC'),
    chosen,
  }
}
