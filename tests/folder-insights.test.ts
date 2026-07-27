import { describe, expect, it } from 'vitest'

import { buildFolderInsights } from '../lib/folder-insights'

describe('folder insights', () => {
  it('rolls category clicks up to the client and preserves the event folder', () => {
    const insights = buildFolderInsights({
      period: '7d',
      now: new Date('2026-07-27T12:00:00.000Z'),
      timeZone: 'Europe/Paris',
      folders: [
        { id: 'client', name: 'Client A', parentId: null },
        { id: 'twitter', name: 'Twitter', parentId: 'client' },
        { id: 'reddit', name: 'Reddit', parentId: 'client' },
      ],
      links: [
        {
          id: 'campaign',
          folderId: 'reddit',
          isDirect: true,
          title: 'Direct link',
          internalName: 'Summer campaign',
          slug: 'abc123',
        },
      ],
      clicks: [
        {
          linkId: 'campaign',
          folderIdAtClick: 'twitter',
          createdAt: new Date('2026-07-27T08:00:00.000Z'),
        },
        {
          linkId: 'campaign',
          folderIdAtClick: 'reddit',
          createdAt: new Date('2026-07-27T09:00:00.000Z'),
        },
      ],
    })

    expect(insights.find(folder => folder.id === 'client')?.totalClicks).toBe(2)
    expect(insights.find(folder => folder.id === 'twitter')?.totalClicks).toBe(1)
    expect(insights.find(folder => folder.id === 'reddit')?.totalClicks).toBe(1)
    expect(insights.find(folder => folder.id === 'client')?.topLinks[0]).toMatchObject({
      name: 'Summer campaign',
      clicks: 2,
    })
  })

  it('does not count a landing-page view as a completed click', () => {
    const [insight] = buildFolderInsights({
      period: 'today',
      now: new Date('2026-07-27T12:00:00.000Z'),
      timeZone: 'UTC',
      folders: [{ id: 'client', name: 'Client A', parentId: null }],
      links: [{
        id: 'page',
        folderId: 'client',
        isDirect: false,
        title: 'Landing page',
        slug: 'landing',
      }],
      clicks: [{
        linkId: 'page',
        folderIdAtClick: 'client',
        multiLinkId: null,
        createdAt: new Date('2026-07-27T08:00:00.000Z'),
      }],
    })

    expect(insight.totalClicks).toBe(0)
  })
})
