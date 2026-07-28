import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const startedAt = Date.now()

  try {
    await prisma.user.findFirst({ select: { id: true } })
    return NextResponse.json(
      {
        status: 'ok',
        database: 'ok',
        responseTimeMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' } }
    )
  } catch (error) {
    console.error('Health check failed:', error)
    return NextResponse.json(
      {
        status: 'degraded',
        database: 'unavailable',
        timestamp: new Date().toISOString(),
      },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    )
  }
}
