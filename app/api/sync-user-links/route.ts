import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    const currentUserId = session.user.id
    const userEmail = session.user.email

    // 1. Trouver tous les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: userEmail,
        id: { not: currentUserId } // Exclure l'utilisateur actuel
      }
    })

    if (allUsers.length === 0) {
      return NextResponse.json({ 
        message: 'Aucune synchronisation nécessaire',
        currentUserId 
      })
    }

    // 2. Pour chaque ancien utilisateur, migrer les liens
    let migratedLinks = 0
    for (const oldUser of allUsers) {
      // Migrer les liens
      const result = await prisma.link.updateMany({
        where: {
          userId: oldUser.id
        },
        data: {
          userId: currentUserId
        }
      })
      
      migratedLinks += result.count

      // Migrer aussi les clics
      await prisma.click.updateMany({
        where: {
          userId: oldUser.id
        },
        data: {
          userId: currentUserId
        }
      })

      // Migrer les analytics
      await prisma.analyticsEvent.updateMany({
        where: {
          userId: oldUser.id
        },
        data: {
          userId: currentUserId
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: `${migratedLinks} liens migrés avec succès`,
      currentUserId,
      oldUserIds: allUsers.map(u => u.id)
    })

  } catch (error) {
    console.error('Erreur sync:', error)
    return NextResponse.json({ 
      error: 'Erreur de synchronisation',
      details: error.message 
    }, { status: 500 })
  }
}