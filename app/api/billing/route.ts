import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { checkUsageLimits } from '@/lib/usage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer les informations de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        planType: true,
        subscriptions: {
          where: { status: { in: ['ACTIVE', 'TRIALING', 'PAST_DUE'] } },
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 })
    }

    // Récupérer les limites d'usage
    const usage = await checkUsageLimits(session.user.id)

    const billing = {
      subscription: user.subscriptions[0] || null,
      usage: usage.usage,
      plan: usage.plan
    }

    return NextResponse.json(billing)
  } catch (error) {
    console.error('Billing error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données de facturation' }, { status: 500 })
  }
}