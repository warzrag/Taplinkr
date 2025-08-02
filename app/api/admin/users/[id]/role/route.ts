import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const { role } = await request.json()

    // Vérifier que le rôle est valide
    if (!['user', 'admin', 'manager'].includes(role)) {
      return NextResponse.json(
        { error: 'Rôle invalide' },
        { status: 400 }
      )
    }

    // Seul l'admin peut créer des managers ou modifier le rôle admin
    if ((role === 'manager' || role === 'admin') && session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Seul l\'administrateur peut attribuer les rôles manager et admin' },
        { status: 403 }
      )
    }

    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    // Ne pas permettre de modifier son propre rôle
    if (user.id === session.user.id) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier votre propre rôle' },
        { status: 403 }
      )
    }

    // Un manager ne peut pas modifier le rôle d'un autre manager ou admin
    if (session.user.role === 'manager' && (user.role === 'admin' || user.role === 'manager')) {
      return NextResponse.json(
        { error: 'Vous ne pouvez pas modifier le rôle d\'un administrateur ou manager' },
        { status: 403 }
      )
    }

    // Mettre à jour le rôle
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role }
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erreur lors de la modification du rôle:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}