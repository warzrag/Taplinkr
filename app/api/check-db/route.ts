import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Vérifier si DATABASE_URL est défini
    const hasDbUrl = !!process.env.DATABASE_URL
    const dbUrlPartial = process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.substring(0, 30) + '...'
      : 'NON DÉFINI'
    
    // Tenter une connexion simple
    let dbStatus = 'not_tested'
    let userCount = 0
    let linkCount = 0
    
    try {
      userCount = await prisma.user.count()
      linkCount = await prisma.link.count()
      dbStatus = 'connected'
    } catch (dbError: any) {
      dbStatus = dbError.message || 'connection_failed'
    }
    
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      hasDbUrl,
      dbUrlPartial,
      dbStatus,
      stats: {
        users: userCount,
        links: linkCount
      },
      nextAuthUrl: process.env.NEXTAUTH_URL || 'NON DÉFINI',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: String(error),
      environment: process.env.NODE_ENV,
      hasDbUrl: !!process.env.DATABASE_URL
    }, { status: 500 })
  }
}