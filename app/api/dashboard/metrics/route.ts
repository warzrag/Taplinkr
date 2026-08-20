import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { memoryCache } from '@/lib/cache'
import {
  calculateDailyLinkClicks,
  calculateDashboardMetrics,
  calculateHourlyClicks,
  dashboardDateKeys,
  dateKeyInTimeZone,
  nextDateKey,
  zonedDayStart,
  type DashboardPeriod,
} from '@/lib/dashboard-metrics'
import { prisma } from '@/lib/prisma'
import {
  isValidTimeZone,
  readReportingTimeZone,
  writeReportingTimeZone,
} from '@/lib/reporting-timezone'

const periods = new Set<DashboardPeriod>(['today', '7d', '30d'])

// Le calcul complet enchaine cinq allers-retours vers la base puis agrege les
// clics un par un. Le garder brievement evite de tout refaire quand on change
// de periode et qu'on revient, ou qu'on revient sur l'onglet.
// Attention : ce cache vit dans la memoire de l'instance. Sur une instance
// froide il est vide, il ne remplace donc pas l'instantane cote navigateur.
const METRICS_TTL_MS = 30_000

export async function GET(request: NextRequest) {
  // Chronometrage des etapes. Sans lui, impossible de savoir si le temps part
  // dans les allers-retours vers Firestore, dans la lecture des clics, ou dans
  // le calcul. Renvoye en en-tete Server-Timing, lisible dans l'onglet Reseau.
  const t0 = Date.now()
  let mark = t0
  const timings: Array<[string, number]> = []
  const step = (label: string) => {
    const at = Date.now()
    timings.push([label, at - mark])
    mark = at
  }
  const timingHeader = () => timings.map(([label, ms]) => `${label};dur=${ms}`).join(', ')

  try {
    const session = await getServerSession(authOptions)
    step('session')
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Filtre optionnel sur un seul lien. Toute la route calcule a partir de la
    // liste des liens : la restreindre suffit a cadrer chaque chiffre.
    const requestedLinkId = request.nextUrl.searchParams.get('linkId')
    const requestedPeriod = request.nextUrl.searchParams.get('period') as DashboardPeriod | null
    const period = requestedPeriod && periods.has(requestedPeriod) ? requestedPeriod : '30d'
    const now = new Date()

    // La cle contient l'identifiant du compte : jamais de fuite entre comptes.
    const cacheKey = `dashboard:metrics:${session.user.id}:${period}:${requestedLinkId || 'all'}`
    const wantsTimings = request.nextUrl.searchParams.get('timings') === '1'
    const cached = wantsTimings ? null : memoryCache.get(cacheKey)
    if (cached) {
      step('cache')
      return NextResponse.json(cached, {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
          'Server-Timing': timingHeader(),
        },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        teamId: true,
        team: { select: { ownerId: true } },
      },
    })
    const reportingUserId = user?.team?.ownerId || session.user.id
    step('user')
    // Le profil et la liste des coequipiers ne dependent que de `user` : rien
    // ne justifiait de les enchainer l'un apres l'autre.
    const [reportingProfile, teamMembers] = await Promise.all([
      prisma.userProfile.findUnique({
        where: { userId: reportingUserId },
        select: { analytics: true },
      }),
      user?.teamId
        ? prisma.user.findMany({
            where: { teamId: user.teamId },
            select: { id: true },
          })
        : Promise.resolve([] as Array<{ id: string }>),
    ])
    const storedTimeZone = readReportingTimeZone(reportingProfile?.analytics)
    step('profil+equipe')
    const geoTimeZone = request.headers.get('x-vercel-ip-timezone')
    const browserTimeZone = request.nextUrl.searchParams.get('timeZone')
    const inferredTimeZone = isValidTimeZone(geoTimeZone)
      ? geoTimeZone
      : isValidTimeZone(browserTimeZone)
        ? browserTimeZone
        : 'UTC'
    const timeZone = storedTimeZone || inferredTimeZone

    if (!storedTimeZone) {
      await prisma.userProfile.upsert({
        where: { userId: reportingUserId },
        create: {
          userId: reportingUserId,
          analytics: writeReportingTimeZone(null, timeZone),
        },
        update: {
          analytics: writeReportingTimeZone(reportingProfile?.analytics, timeZone),
        },
      })
    }
    const visibleUserIds = [...new Set([session.user.id, ...teamMembers.map(member => member.id)])]
    const allLinks = await prisma.link.findMany({
      where: user?.teamId
        ? {
            OR: [
              { userId: { in: visibleUserIds } },
              { teamId: user.teamId, teamShared: true },
            ],
          }
        : { userId: session.user.id },
      select: {
        id: true,
        slug: true,
        title: true,
        internalName: true,
        isDirect: true,
      },
      orderBy: { order: 'asc' },
    })
    // Un seul point de filtrage : tout ce qui suit (courbe, cartes, activite,
    // comptage du bruit) se calcule a partir de cette liste. Un identifiant
    // inconnu ou n appartenant pas au compte donne une liste vide, donc un
    // dashboard vide, jamais les chiffres de quelqu un d autre.
    const links = requestedLinkId
      ? allLinks.filter((link: any) => link.id === requestedLinkId)
      : allLinks
    const linkIds = new Set(links.map(link => link.id))
    step('liens')

    if (linkIds.size === 0) {
      const emptyMetrics = calculateDashboardMetrics({
        clicks: [],
        filteredClicks: [],
        directLinkIds: new Set(),
      })
      return NextResponse.json({
        period,
        ...emptyMetrics,
        changes: { realClicks: 0, uniqueVisitors: 0, clickThroughRate: 0, botsFiltered: 0 },
        links: [],
        dailyClicks: [],
        hourlyClicks: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: 0 })),
        topLinks: [],
        recentActivity: [],
      })
    }

    const periodDays = period === 'today' ? 1 : period === '7d' ? 7 : 30
    const currentDateKeys = dashboardDateKeys(period, now, timeZone)
    const currentDates = new Set(currentDateKeys)
    const previousDateKeys = dashboardDateKeys(period, now, timeZone, periodDays)
    const previousDates = new Set(previousDateKeys)

    // Borne basse des lectures. Sans elle, chaque affichage du dashboard relisait
    // la totalite de l'historique de clics pour n'en garder que la periode
    // demandee : le cout augmentait indefiniment avec l'anciennete du compte.
    // previousDateKeys[0] est le jour le plus ancien reellement utilise ; on
    // recule de deux jours parce que les cles de date sont calculees dans le
    // fuseau du compte et non en UTC.
    const since = new Date(`${previousDateKeys[0]}T00:00:00.000Z`)
    since.setUTCDate(since.getUTCDate() - 2)

    // Lecture bornee a la periode affichee. Sans cette borne, tout l'historique
    // etait relu a chaque affichage.
    //
    // Sur Firestore, combiner un `in` sur linkId et une borne sur createdAt
    // exige un index composite (linkId ASC, createdAt ASC). S'il manque, la
    // requete echoue avec FAILED_PRECONDITION (code 9). Plutot que de casser le
    // dashboard, on refait alors la lecture sans borne de date : c'est lent,
    // mais les chiffres restent justes. L'index est declare dans
    // firestore.indexes.json.
    const linkIdList = [...linkIds]
    const MISSING_INDEX = 9
    const isMissingIndex = (error: unknown) => (error as any)?.code === MISSING_INDEX
    const warnMissingIndex = (label: string) => console.warn(
      `[metrics] index composite absent pour ${label}, lecture sans borne de date (lent). ` +
      `Deployer firestore.indexes.json pour retablir la performance.`,
    )

    // Temoins : disent si chaque lecture a pu utiliser son index, ou si elle a
    // du retomber sur le chemin lent. Sans eux, impossible de le savoir.
    let clicsBornes = true
    let bruitCompteEnBase = true

    const clickFields = {
      id: true,
      linkId: true,
      createdAt: true,
      ip: true,
      sessionId: true,
      multiLinkId: true,
      country: true,
      device: true,
    } as const
    const filteredFields = { linkId: true, reason: true, createdAt: true } as const

    const loadClicks = async () => {
      try {
        return await prisma.click.findMany({
          where: { linkId: { in: linkIdList }, createdAt: { gte: since } },
          select: clickFields,
        })
      } catch (error) {
        if (!isMissingIndex(error)) throw error
        warnMissingIndex('clicks')
        clicsBornes = false
        return prisma.click.findMany({
          where: { linkId: { in: linkIdList } },
          select: clickFields,
        })
      }
    }

    // Bruit ecarte : on ne veut qu'un nombre par periode. Le lire document par
    // document representait 77 % de tout ce que le dashboard lisait.
    // Firestore sait compter sans rien transferer, a condition de borner sur un
    // intervalle plutot que de regrouper par cle de date : d'ou les bornes
    // exactes calculees dans le fuseau du compte.
    const currentStart = zonedDayStart(currentDateKeys[0], timeZone)
    const currentEnd = zonedDayStart(nextDateKey(currentDateKeys[currentDateKeys.length - 1]), timeZone)
    const previousStart = zonedDayStart(previousDateKeys[0], timeZone)

    const countNoise = (from: Date, to: Date) => prisma.filteredClick.count({
      where: { linkId: { in: linkIdList }, createdAt: { gte: from, lt: to } },
    })

    const loadNoiseCounts = async (): Promise<[number, number]> => {
      try {
        const [current, previous] = await Promise.all([
          countNoise(currentStart, currentEnd),
          countNoise(previousStart, currentStart),
        ])
        return [current, previous]
      } catch (error) {
        if (!isMissingIndex(error)) throw error
        warnMissingIndex('filteredClicks')
        bruitCompteEnBase = false
        // Sans l'index, on relit et on regroupe comme avant.
        const all = await prisma.filteredClick.findMany({
          where: { linkId: { in: linkIdList } },
          select: filteredFields,
        })
        const inWindow = (createdAt: Date, dates: Set<string>) => dates.has(dateKeyInTimeZone(createdAt, timeZone))
        return [
          all.filter(item => inWindow(item.createdAt, currentDates)).length,
          all.filter(item => inWindow(item.createdAt, previousDates)).length,
        ]
      }
    }

    const [allClicks, [currentNoise, previousNoise]] = await Promise.all([loadClicks(), loadNoiseCounts()])
    step('lecture-clics')
    const isInDates = (createdAt: Date, dates: Set<string>) => dates.has(dateKeyInTimeZone(createdAt, timeZone))
    const recentClicks = allClicks.filter(click => isInDates(click.createdAt, currentDates))
    const previousClicks = allClicks.filter(click => isInDates(click.createdAt, previousDates))
    const directLinkIds = new Set<string>(
      links
        .filter((link: any) => link.isDirect)
        .map((link: any) => String(link.id)),
    )

    // botsFiltered compte desormais TOUT le bruit ecarte, pas seulement les
    // motifs bot / preview / prefetch. Les doublons et les rafales en font
    // partie : ils representaient la totalite du bruit reel, et la carte
    // affichait donc zero alors que des milliers de clics etaient ecartes.
    const metrics = {
      ...calculateDashboardMetrics({ clicks: recentClicks, filteredClicks: [], directLinkIds }),
      botsFiltered: currentNoise,
    }
    const previousMetrics = {
      ...calculateDashboardMetrics({ clicks: previousClicks, filteredClicks: [], directLinkIds }),
      botsFiltered: previousNoise,
    }
    const dailyBreakdown = calculateDailyLinkClicks({
      period,
      now,
      timeZone,
      clicks: recentClicks,
      links: links.map(link => ({
        id: link.id,
        name: link.internalName?.trim() || link.title,
        slug: link.slug,
        isDirect: link.isDirect,
      })),
    })
    const hourlyClicks = calculateHourlyClicks({ now, timeZone, clicks: recentClicks, directLinkIds })
    const completedClickCountByLink = (items: typeof recentClicks) => {
      const counts = new Map<string, number>()
      for (const click of items) {
        if (!click.multiLinkId && !directLinkIds.has(click.linkId)) continue
        counts.set(click.linkId, (counts.get(click.linkId) || 0) + 1)
      }
      return counts
    }
    const currentByLink = completedClickCountByLink(recentClicks)
    const previousByLink = completedClickCountByLink(previousClicks)
    const topLinks = links
      .map(link => ({
        id: link.id,
        name: link.internalName?.trim() || link.title,
        slug: link.slug,
        clicks: currentByLink.get(link.id) || 0,
        previousClicks: previousByLink.get(link.id) || 0,
      }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 5)
    const linkNames = new Map(links.map(link => [link.id, link.internalName?.trim() || link.title]))
    const recentActivity = recentClicks
      .filter(click => Boolean(click.multiLinkId) || directLinkIds.has(click.linkId))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map(click => ({
        id: click.id,
        linkId: click.linkId,
        linkName: linkNames.get(click.linkId) || 'Link',
        createdAt: click.createdAt.toISOString(),
        country: click.country || null,
        device: click.device || null,
      }))
    const percentageChange = (current: number, previous: number) => {
      if (previous === 0) return current === 0 ? 0 : 100
      return Number((((current - previous) / previous) * 100).toFixed(1))
    }

    const payload = {
      period,
      start: currentDateKeys[0],
      end: now.toISOString(),
      timeZone,
      ...metrics,
      ...dailyBreakdown,
      hourlyClicks,
      topLinks,
      recentActivity,
      changes: {
        realClicks: percentageChange(metrics.realClicks, previousMetrics.realClicks),
        uniqueVisitors: percentageChange(metrics.uniqueVisitors, previousMetrics.uniqueVisitors),
        clickThroughRate: percentageChange(metrics.clickThroughRate, previousMetrics.clickThroughRate),
        botsFiltered: percentageChange(metrics.botsFiltered, previousMetrics.botsFiltered),
      },
    }

    memoryCache.set(cacheKey, payload, METRICS_TTL_MS)
    step('calcul')

    // Le nombre de documents lus dit si la borne de date fait effet. S'il est
    // enorme alors que la periode est courte, l'index composite n'est pas actif.
    const diagnostic = {
      totalMs: Date.now() - t0,
      etapes: Object.fromEntries(timings),
      clicsLus: allClicks.length,
      bruitEcarteCompte: currentNoise,
      clicsBornes,
      bruitCompteEnBase,
      liens: linkIdList.length,
    }

    if (request.nextUrl.searchParams.get('timings') === '1') {
      return NextResponse.json({ diagnostic, apercu: { realClicks: metrics.realClicks } }, {
        headers: { 'Cache-Control': 'private, no-store' },
      })
    }

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
        'Server-Timing': timingHeader(),
      },
    })
  } catch (error) {
    console.error('Unable to load dashboard metrics:', error)
    return NextResponse.json({ error: 'Unable to load dashboard metrics' }, { status: 500 })
  }
}
