import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        plan: true,
        emailVerified: true,
        createdAt: true,
        _count: {
          select: {
            links: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Ajouter isActive avec une valeur par défaut si elle n'existe pas
    const usersWithActive = users.map(user => ({
      ...user,
      isActive: true // Temporairement, tous les utilisateurs sont actifs
    }))

    return NextResponse.json(usersWithActive)
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}