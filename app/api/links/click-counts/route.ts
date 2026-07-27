import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

export const dynamic = 'force-dynamic'

/**
 * Lightweight endpoint used by the Links screen.
 *
 * The previous live refresh called /api/links/fast every five seconds. That
 * endpoint hydrates users, teams and link relations, which is unnecessarily
 * expensive when the UI only needs the latest counter values.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const queries = [
      db.collection('links')
        .where('userId', '==', session.user.id)
        .select('clicks'),
    ]

    if (session.user.teamId) {
      queries.push(
        db.collection('links')
          .where('teamId', '==', session.user.teamId)
          .select('clicks'),
      )
    }

    const snapshots = await Promise.all(queries.map(query => query.get()))
    const counts = new Map<string, number>()

    for (const snapshot of snapshots) {
      for (const document of snapshot.docs) {
        counts.set(document.id, Number(document.data().clicks) || 0)
      }
    }

    return NextResponse.json(
      {
        counts: Array.from(counts, ([id, clicks]) => ({ id, clicks })),
      },
      {
        headers: {
          'Cache-Control': 'private, no-store, max-age=0',
        },
      },
    )
  } catch (error) {
    console.error('Unable to load live click counts:', error)
    return NextResponse.json(
      { error: 'Unable to load click counts right now' },
      { status: 503 },
    )
  }
}
