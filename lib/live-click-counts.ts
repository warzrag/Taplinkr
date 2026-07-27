export interface LiveClickCount {
  id: string
  clicks: number
}

export function reconcileLiveClickCounts(
  latestCounts: LiveClickCount[],
  previousCounts: Record<string, number>,
  animateIncreases: boolean,
) {
  const nextClicks = Object.fromEntries(
    latestCounts.map(item => [item.id, Number(item.clicks) || 0]),
  )

  const increases = animateIncreases
    ? latestCounts
        .map(item => ({
          id: item.id,
          delta: (Number(item.clicks) || 0)
            - (previousCounts[item.id] ?? (Number(item.clicks) || 0)),
        }))
        .filter(item => item.delta > 0)
    : []

  return { nextClicks, increases }
}
