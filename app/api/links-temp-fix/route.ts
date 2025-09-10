import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    console.log('🔍 Session actuelle:', {
      userId: session.user.id,
      email: session.user.email,
      username: session.user.username
    })

    // 1. Chercher TOUS les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        email: true,
        username: true,
        _count: {
          select: {
            links: true
          }
        }
      }
    })

    console.log('👥 Utilisateurs trouvés:', allUsers)

    // 2. Chercher les liens pour CHAQUE utilisateur trouvé
    let allLinks = []
    for (const user of allUsers) {
      const userLinks = await prisma.link.findMany({
        where: {
          userId: user.id
        },
        include: {
          multiLinks: true
        },
        orderBy: {
          order: 'asc'
        }
      })
      
      if (userLinks.length > 0) {
        console.log(`✅ ${userLinks.length} liens trouvés pour user ${user.id}`)
        allLinks = allLinks.concat(userLinks)
      }
    }

    // 3. Si on trouve des liens avec un ID différent, retourner ceux-là
    if (allLinks.length > 0) {
      console.log(`🎯 Total: ${allLinks.length} liens trouvés`)
      return NextResponse.json(allLinks)
    }

    // 4. En dernier recours, chercher par username
    if (session.user.username) {
      const linksByUsername = await prisma.link.findMany({
        where: {
          user: {
            username: session.user.username
          }
        },
        include: {
          multiLinks: true
        },
        orderBy: {
          order: 'asc'
        }
      })

      if (linksByUsername.length > 0) {
        console.log(`✅ ${linksByUsername.length} liens trouvés par username`)
        return NextResponse.json(linksByUsername)
      }
    }

    console.log('❌ Aucun lien trouvé')
    return NextResponse.json([])

  } catch (error) {
    console.error('❌ Erreur:', error)
    return NextResponse.json({ 
      error: 'Erreur serveur',
      details: error.message 
    }, { status: 500 })
  }
}