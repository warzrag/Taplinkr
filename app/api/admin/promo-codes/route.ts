import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    // Seul l'admin peut voir les codes promo
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const promoCodes = await prisma.promoCode.findMany({
      include: {
        _count: {
          select: { promoRedemptions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(promoCodes)
  } catch (error) {
    console.error('Erreur lors de la récupération des codes promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seul l'admin peut créer des codes promo
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 403 }
      )
    }

    const data = await request.json()
    const {
      code,
      description,
      discountType,
      discountValue,
      validUntil,
      maxUses,
      requiredPlan
    } = data

    // Validation
    if (!code || !discountType || !discountValue) {
      return NextResponse.json(
        { error: 'Données manquantes' },
        { status: 400 }
      )
    }

    if (discountType === 'percentage' && (discountValue < 0 || discountValue > 100)) {
      return NextResponse.json(
        { error: 'Le pourcentage doit être entre 0 et 100' },
        { status: 400 }
      )
    }

    if (discountType === 'fixed_days' && discountValue < 1) {
      return NextResponse.json(
        { error: 'Le nombre de jours doit être positif' },
        { status: 400 }
      )
    }

    // Créer le code promo
    const promoCode = await prisma.promoCode.create({
      data: {
        code: code.toUpperCase(),
        description,
        discountType,
        discountValue: parseInt(discountValue),
        validUntil: validUntil ? new Date(validUntil) : null,
        maxUses: maxUses ? parseInt(maxUses) : null,
        requiredPlan,
        createdBy: session.user.id
      }
    })

    return NextResponse.json(promoCode)
  } catch (error) {
    console.error('Erreur lors de la création du code promo:', error)
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    )
  }
}