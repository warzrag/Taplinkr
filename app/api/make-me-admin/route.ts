import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      )
    }
    
    // Vérifier si c'est le premier utilisateur
    const userCount = await prisma.user.count()
    
    if (userCount > 1) {
      return NextResponse.json(
        { error: 'Seul le premier utilisateur peut devenir admin automatiquement' },
        { status: 403 }
      )
    }
    
    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { 
        role: 'admin',
        plan: 'premium'
      }
    })
    
    return NextResponse.json({
      message: 'Vous êtes maintenant admin !',
      user: {
        email: updatedUser.email,
        role: updatedUser.role,
        plan: updatedUser.plan
      }
    })
    
  } catch (error: any) {
    console.error('Erreur make-me-admin:', error)
    return NextResponse.json(
      { error: 'Erreur serveur', details: error.message },
      { status: 500 }
    )
  }
}