import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'manager')) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const { isActive } = await request.json()
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true } })
    if (!target) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    if (target.id === session.user.id) {
      return NextResponse.json({ error: 'Vous ne pouvez pas désactiver votre propre compte' }, { status: 400 })
    }
    if (session.user.role === 'manager' && target.role !== 'user') {
      return NextResponse.json({ error: 'Action réservée aux administrateurs' }, { status: 403 })
    }

    await prisma.user.update({
      where: { id },
      data: { isActive, ...(isActive ? {} : { sessionVersion: { increment: 1 } }) },
    })

    // Pour l'instant, on ne fait que retourner un succès
    // car la colonne isActive n'existe pas encore dans la DB
    return NextResponse.json({ 
      success: true,
      message: isActive ? 'Utilisateur activé' : 'Utilisateur désactivé' 
    })
  } catch (error) {
    console.error('Erreur lors de la modification de l\'utilisateur:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}
