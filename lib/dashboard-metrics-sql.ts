import { Prisma } from '@prisma/client'

import { prisma } from './prisma'

/**
 * Agregation des metriques du dashboard cote base.
 *
 * La version precedente telechargeait chaque clic de la periode puis les
 * additionnait en JavaScript. Ici Postgres renvoie directement les totaux :
 * quelques dizaines de lignes au lieu de dizaines de milliers.
 *
 * Les regles sont reproduites a l'identique de lib/dashboard-metrics.ts.
 * Deux details comptent :
 *  - en JavaScript, `a || b` considere la chaine vide comme absente, d'ou les
 *    NULLIF('') ; un COALESCE seul ne traiterait que NULL et donnerait des
 *    chiffres differents ;
 *  - `Boolean(multiLinkId)` suit la meme regle, une chaine vide n'est pas un
 *    clic abouti.
 *
 * Le decoupage par jour se fait dans le fuseau du compte, comme
 * dateKeyInTimeZone : createdAt est stocke en timestamp sans fuseau (UTC), il
 * faut donc l'interpreter en UTC avant de le convertir.
 */

export type WindowKey = 'current' | 'previous'

export type WindowTotals = {
  pageViews: number
  realClicks: number
  uniqueVisitors: number
  visitsWithClick: number
  botsFiltered: number
}

export type DashboardAggregates = {
  totals: Record<WindowKey, WindowTotals>
  /** window -> linkId -> clics aboutis */
  completedByLink: Record<WindowKey, Map<string, number>>
  /** jour (AAAA-MM-JJ) -> linkId -> clics aboutis, periode courante seulement */
  completedByDay: Map<string, Map<string, number>>
  /** 24 cases, clics aboutis du jour courant dans le fuseau du compte */
  hourlyCompleted: number[]
  recentActivity: Array<{
    id: string
    linkId: string
    createdAt: Date
    country: string | null
    device: string | null
  }>
}

const emptyTotals = (): WindowTotals => ({
  pageViews: 0,
  realClicks: 0,
  uniqueVisitors: 0,
  visitsWithClick: 0,
  botsFiltered: 0,
})

const num = (value: unknown) => Number(value ?? 0)

export async function loadDashboardAggregates(input: {
  linkIds: string[]
  directLinkIds: string[]
  timeZone: string
  since: Date
  currentDateKeys: string[]
  previousDateKeys: string[]
  todayKey: string
  recentActivityLimit: number
}): Promise<DashboardAggregates> {
  const totals: Record<WindowKey, WindowTotals> = {
    current: emptyTotals(),
    previous: emptyTotals(),
  }
  const completedByLink: Record<WindowKey, Map<string, number>> = {
    current: new Map(),
    previous: new Map(),
  }
  const completedByDay = new Map<string, Map<string, number>>()
  const hourlyCompleted = Array.from({ length: 24 }, () => 0)

  if (input.linkIds.length === 0) {
    return { totals, completedByLink, completedByDay, hourlyCompleted, recentActivity: [] }
  }

  const linkIdList = Prisma.join(input.linkIds)
  const currentDays = Prisma.join(input.currentDateKeys)
  const previousDays = Prisma.join(input.previousDateKeys)

  // Un lien direct compte comme abouti meme sans multiLinkId. Sans lien direct,
  // la condition doit rester fausse plutot que de produire un IN () invalide.
  const isCompleted = input.directLinkIds.length
    ? Prisma.sql`(NULLIF(c."multiLinkId", '') IS NOT NULL OR c."linkId" IN (${Prisma.join(input.directLinkIds)}))`
    : Prisma.sql`(NULLIF(c."multiLinkId", '') IS NOT NULL)`

  const dayExpr = Prisma.sql`to_char(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${input.timeZone}::text, 'YYYY-MM-DD')`
  const visitorExpr = Prisma.sql`COALESCE(NULLIF(c."sessionId", ''), NULLIF(c."ip", ''), c."id")`

  const [scalarRows, byDayRows, hourRows, filteredRows, recentRows] = await Promise.all([
    // Totaux par fenetre. Les comptages DISTINCT ne peuvent pas etre additionnes
    // a partir d'un decoupage journalier : ils sont calcules sur la fenetre entiere.
    prisma.$queryRaw<Array<{
      bucket: WindowKey
      page_views: bigint
      real_clicks: bigint
      unique_visitors: bigint
      visits_with_click: bigint
    }>>`
      WITH base AS (
        SELECT
          c."linkId" AS link_id,
          ${dayExpr} AS day,
          ${visitorExpr} AS visitor,
          ${isCompleted} AS completed,
          (NULLIF(c."multiLinkId", '') IS NULL) AS page_view
        FROM "clicks" c
        WHERE c."linkId" IN (${linkIdList}) AND c."createdAt" >= ${input.since}::timestamp
      )
      SELECT
        CASE WHEN day IN (${currentDays}) THEN 'current' ELSE 'previous' END AS bucket,
        COUNT(*) FILTER (WHERE page_view) AS page_views,
        COUNT(*) FILTER (WHERE completed) AS real_clicks,
        COUNT(DISTINCT visitor) AS unique_visitors,
        COUNT(DISTINCT CASE WHEN completed THEN link_id || ':' || visitor END) AS visits_with_click
      FROM base
      WHERE day IN (${currentDays}) OR day IN (${previousDays})
      GROUP BY 1
    `,

    // Clics aboutis par fenetre, par jour et par lien. Sert a la fois au
    // classement des liens et au detail journalier.
    prisma.$queryRaw<Array<{
      bucket: WindowKey
      day: string
      link_id: string
      clicks: bigint
    }>>`
      WITH base AS (
        SELECT
          c."linkId" AS link_id,
          ${dayExpr} AS day,
          ${isCompleted} AS completed
        FROM "clicks" c
        WHERE c."linkId" IN (${linkIdList}) AND c."createdAt" >= ${input.since}::timestamp
      )
      SELECT
        CASE WHEN day IN (${currentDays}) THEN 'current' ELSE 'previous' END AS bucket,
        day,
        link_id,
        COUNT(*) AS clicks
      FROM base
      WHERE completed AND (day IN (${currentDays}) OR day IN (${previousDays}))
      GROUP BY 1, 2, 3
    `,

    // Repartition horaire du jour courant, dans le fuseau du compte.
    prisma.$queryRaw<Array<{ hour: number; clicks: bigint }>>`
      SELECT
        EXTRACT(HOUR FROM (c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${input.timeZone}::text))::int AS hour,
        COUNT(*) AS clicks
      FROM "clicks" c
      WHERE c."linkId" IN (${linkIdList})
        AND c."createdAt" >= ${input.since}::timestamp
        AND ${dayExpr} = ${input.todayKey}
        AND ${isCompleted}
      GROUP BY 1
    `,

    // Clics ecartes, uniquement les motifs comptes comme robots.
    prisma.$queryRaw<Array<{ bucket: WindowKey; clicks: bigint }>>`
      WITH base AS (
        SELECT
          to_char(c."createdAt" AT TIME ZONE 'UTC' AT TIME ZONE ${input.timeZone}::text, 'YYYY-MM-DD') AS day
        FROM "filtered_clicks" c
        WHERE c."linkId" IN (${linkIdList})
          AND c."createdAt" >= ${input.since}::timestamp
          AND c."reason" IN ('bot', 'preview', 'prefetch')
      )
      SELECT
        CASE WHEN day IN (${currentDays}) THEN 'current' ELSE 'previous' END AS bucket,
        COUNT(*) AS clicks
      FROM base
      WHERE day IN (${currentDays}) OR day IN (${previousDays})
      GROUP BY 1
    `,

    // Activite recente : seules les dernieres lignes sont remontees.
    prisma.$queryRaw<Array<{
      id: string
      link_id: string
      created_at: Date
      country: string | null
      device: string | null
    }>>`
      SELECT c."id", c."linkId" AS link_id, c."createdAt" AS created_at, c."country", c."device"
      FROM "clicks" c
      WHERE c."linkId" IN (${linkIdList})
        AND c."createdAt" >= ${input.since}::timestamp
        AND ${isCompleted}
        AND ${dayExpr} IN (${currentDays})
      ORDER BY c."createdAt" DESC
      LIMIT ${input.recentActivityLimit}
    `,
  ])

  for (const row of scalarRows) {
    const target = totals[row.bucket]
    if (!target) continue
    target.pageViews = num(row.page_views)
    target.realClicks = num(row.real_clicks)
    target.uniqueVisitors = num(row.unique_visitors)
    target.visitsWithClick = num(row.visits_with_click)
  }

  for (const row of filteredRows) {
    const target = totals[row.bucket]
    if (target) target.botsFiltered = num(row.clicks)
  }

  for (const row of byDayRows) {
    const clicks = num(row.clicks)
    const perLink = completedByLink[row.bucket]
    if (perLink) perLink.set(row.link_id, (perLink.get(row.link_id) || 0) + clicks)

    if (row.bucket === 'current') {
      const day = completedByDay.get(row.day) || new Map<string, number>()
      day.set(row.link_id, (day.get(row.link_id) || 0) + clicks)
      completedByDay.set(row.day, day)
    }
  }

  for (const row of hourRows) {
    if (Number.isInteger(row.hour) && row.hour >= 0 && row.hour < 24) {
      hourlyCompleted[row.hour] = num(row.clicks)
    }
  }

  return {
    totals,
    completedByLink,
    completedByDay,
    hourlyCompleted,
    recentActivity: recentRows.map(row => ({
      id: row.id,
      linkId: row.link_id,
      createdAt: row.created_at,
      country: row.country,
      device: row.device,
    })),
  }
}
