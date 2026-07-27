import { describe, expect, it } from 'vitest'

import { reconcileLiveClickCounts } from '../lib/live-click-counts'

describe('live click count reconciliation', () => {
  const latest = [
    { id: 'madison', clicks: 91 },
    { id: 'garden', clicks: 12 },
  ]

  it('synchronizes stale cached values without showing fake new-click animations', () => {
    expect(reconcileLiveClickCounts(latest, {
      madison: 71,
      garden: 8,
    }, false)).toEqual({
      nextClicks: {
        madison: 91,
        garden: 12,
      },
      increases: [],
    })
  })

  it('animates only increases received after the initial synchronization', () => {
    expect(reconcileLiveClickCounts([
      { id: 'madison', clicks: 93 },
      { id: 'garden', clicks: 11 },
    ], {
      madison: 91,
      garden: 12,
    }, true)).toEqual({
      nextClicks: {
        madison: 93,
        garden: 11,
      },
      increases: [
        { id: 'madison', delta: 2 },
      ],
    })
  })

  it('does not animate a link that appears for the first time', () => {
    expect(reconcileLiveClickCounts([
      { id: 'new-link', clicks: 25 },
    ], {}, true).increases).toEqual([])
  })
})
