import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test simple de connexion
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Compter les utilisateurs de manière sécurisée
    let userCount = 0
    try {
      userCount = await prisma.user.count()
    } catch (e) {
      console.error('Erreur count users:', e)
    }
    
    return NextResponse.json({
      status: 'connected',
      test: result,
      users: userCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}