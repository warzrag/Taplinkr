import {
  dashboardDateKeys,
  dateKeyInTimeZone,
  type DashboardPeriod,
} from './dashboard-metrics'

type InsightFolder = {
  id: string
  name: string
  parentId?: string | null
}

type InsightLink = {
  id: string
  folderId?: string | null
  isDirect: boolean
  title: string
  internalName?: string | null
  slug: string
}

type InsightClick = {
  linkId: string
  folderIdAtClick?: string | null
  multiLinkId?: string | null
  createdAt: Date
}

export function buildFolderInsights(input: {
  period: DashboardPeriod
  now: Date
  timeZone: string
  folders: InsightFolder[]
  links: InsightLink[]
  clicks: InsightClick[]
}) {
  const dates = dashboardDateKeys(input.period, input.now, input.timeZone)
  const visibleDates = new Set(dates)
  const foldersById = new Map(input.folders.map(folder => [folder.id, folder]))
  const linksById = new Map(input.links.map(link => [link.id, link]))
  const stats = new Map(input.folders.map(folder => [folder.id, {
    id: folder.id,
    name: folder.name,
    directClicks: 0,
    totalClicks: 0,
    dailyClicks: Object.fromEntries(dates.map(date => [date, 0])) as Record<string, number>,
    linkClicks: new Map<string, number>(),
  }]))

  const folderAndAncestors = (folderId: string) => {
    const ids: string[] = []
    const visited = new Set<string>()
    let currentId: string | null | undefined = folderId
    while (currentId && !visited.has(currentId)) {
      visited.add(currentId)
      const folder = foldersById.get(currentId)
      if (!folder) break
      ids.push(folder.id)
      currentId = folder.parentId
    }
    return ids
  }

  for (const click of input.clicks) {
    const link = linksById.get(click.linkId)
    if (!link) continue
    const isCompletedClick = link.isDirect || Boolean(click.multiLinkId)
    if (!isCompletedClick) continue

    const date = dateKeyInTimeZone(click.createdAt, input.timeZone)
    if (!visibleDates.has(date)) continue
    const eventFolderId = click.folderIdAtClick || link.folderId
    if (!eventFolderId) continue

    const folderIds = folderAndAncestors(eventFolderId)
    folderIds.forEach((folderId, index) => {
      const folderStats = stats.get(folderId)
      if (!folderStats) return
      if (index === 0) folderStats.directClicks += 1
      folderStats.totalClicks += 1
      folderStats.dailyClicks[date] = (folderStats.dailyClicks[date] || 0) + 1
      folderStats.linkClicks.set(link.id, (folderStats.linkClicks.get(link.id) || 0) + 1)
    })
  }

  return input.folders.map(folder => {
    const folderStats = stats.get(folder.id)!
    const topLinks = [...folderStats.linkClicks.entries()]
      .map(([linkId, clicks]) => {
        const link = linksById.get(linkId)!
        return {
          id: link.id,
          name: link.internalName?.trim() || link.title,
          slug: link.slug,
          clicks,
        }
      })
      .sort((left, right) => right.clicks - left.clicks)

    return {
      id: folder.id,
      name: folder.name,
      parentId: folder.parentId || null,
      directClicks: folderStats.directClicks,
      totalClicks: folderStats.totalClicks,
      dailyClicks: dates.map(date => ({ date, clicks: folderStats.dailyClicks[date] || 0 })),
      topLinks,
    }
  })
}
