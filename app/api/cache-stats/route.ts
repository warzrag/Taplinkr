import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { cache } from '@/lib/redis-cache'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const stats = cache.stats()

    return NextResponse.json({
      ...stats,
      hitRatePercent: (stats.hitRate * 100).toFixed(1),
      usage: `${stats.size}/${stats.maxSize}`
    })
  } catch (error) {
    console.error('Erreur stats cache:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}