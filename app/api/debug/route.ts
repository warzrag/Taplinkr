import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Tester la connexion
    await prisma.$connect()
    
    // Vérifier les tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    ` as any[]
    
    // Tester une requête simple
    let userCount = 'Error'
    try {
      const count = await prisma.user.count()
      userCount = count.toString()
    } catch (e: any) {
      userCount = e.message
    }
    
    return NextResponse.json({
      status: 'connected',
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing',
      tables: tables.map(t => t.table_name),
      userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      message: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Configured' : 'Missing'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}