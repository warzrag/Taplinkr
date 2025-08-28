import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Non connecté' }, { status: 401 })
    }

    // Mettre à jour le rôle de l'utilisateur connecté en admin
    const updatedUser = await prisma.user.update({
      where: { email: session.user.email },
      data: { role: 'admin' }
    })

    return NextResponse.json({ 
      success: true, 
      message: `L'utilisateur ${updatedUser.email} est maintenant admin`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        username: updatedUser.username
      }
    })
  } catch (error) {
    console.error('Erreur make-admin:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}