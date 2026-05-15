import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorise' }, { status: 403 })
    }

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
  }
}
