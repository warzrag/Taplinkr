import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    // Récupérer tous les utilisateurs (sans les mots de passe)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
        emailVerified: true
      }
    })
    
    return NextResponse.json({
      totalUsers: users.length,
      databaseConnected: true,
      users: users.map(u => ({
        email: u.email,
        username: u.username,
        role: u.role,
        verified: u.emailVerified,
        created: u.createdAt
      }))
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Database error',
      message: error.message,
      databaseConnected: false
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}