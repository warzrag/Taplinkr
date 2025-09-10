import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // Recherche simple et directe
    const links = await prisma.link.findMany({
      where: {
        userId: session.user.id
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Chercher aussi par email au cas où
    const linksByEmail = await prisma.link.findMany({
      where: {
        user: {
          email: session.user.email
        }
      }
    })

    // Chercher tous les utilisateurs avec cet email
    const allUsers = await prisma.user.findMany({
      where: {
        email: session.user.email
      },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        _count: {
          select: {
            links: true
          }
        }
      }
    })

    return NextResponse.json({
      status: 'success',
      currentUserId: session.user.id,
      currentEmail: session.user.email,
      
      links: {
        byUserId: links.length,
        byEmail: linksByEmail.length,
        list: links
      },
      
      users: allUsers.map(u => ({
        ...u,
        linksCount: u._count.links,
        isCurrent: u.id === session.user.id
      })),
      
      summary: {
        totalLinks: Math.max(links.length, linksByEmail.length),
        totalUsers: allUsers.length,
        message: links.length === 0 
          ? "Aucun lien trouvé pour cet utilisateur" 
          : `${links.length} liens trouvés`
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur',
      message: error.message
    }, { status: 500 })
  }
}