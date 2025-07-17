import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Vérifier que l'utilisateur est admin
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, plan, duration, discount } = body

    if (!userId || !plan) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Calculer la date d'expiration
    let planExpiresAt = null
    if (duration > 0) {
      planExpiresAt = new Date()
      planExpiresAt.setDate(planExpiresAt.getDate() + duration)
    }
    // Si duration = -1, c'est à vie donc planExpiresAt reste null

    // Mettre à jour l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt
      }
    })

    // Si c'est une réduction, on pourrait créer un code promo ici
    // Pour l'instant, on met juste à jour le plan
    if (discount && discount < 100) {
      // TODO: Implémenter le système de codes promo
      console.log(`Réduction de ${discount}% appliquée pour l'utilisateur ${userId}`)
    }

    return NextResponse.json({ 
      success: true,
      user: updatedUser 
    })
  } catch (error) {
    console.error('Erreur lors de l\'attribution de l\'accès:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}