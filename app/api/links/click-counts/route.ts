import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

    // Cette route interrogeait Firestore directement, en contournant le point
    // d acces a la base. Elle continuait donc de lire l ancienne base apres le
    // passage a PostgreSQL, et affichait des totaux figes au jour de la bascule.
    const links = await prisma.link.findMany({
      where: session.user.teamId
        ? { OR: [{ userId: session.user.id }, { teamId: session.user.teamId }] }
        : { userId: session.user.id },
      select: { id: true, clicks: true },
    })

    const counts = new Map<string, number>()
    for (const link of links) {
      counts.set(String(link.id), Number(link.clicks) || 0)
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
