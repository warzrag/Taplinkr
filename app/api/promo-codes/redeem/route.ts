import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * Utilisation d un code promotionnel.
 *
 * Cette route interrogeait Firestore directement, en contournant le point
 * d acces a la base. Apres le passage a PostgreSQL elle aurait continue de lire
 * et d ecrire dans l ancienne base : le code aurait paru accepte, sans qu aucun
 * plan ne change reellement. Une panne silencieuse.
 *
 * Les trois ecritures doivent rester solidaires : accorder le Premium, marquer
 * le code comme utilise par cette personne, incrementer le compteur. Une
 * transaction garantit qu on ne puisse pas offrir le plan sans enregistrer
 * l utilisation, ce qui permettrait de rejouer le code indefiniment.
 */

const asDate = (value: unknown): Date | null => {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value as string)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const code = String((await request.json()).code || '').trim().toUpperCase()
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return NextResponse.json({ error: 'Invalid promo code' }, { status: 400 })
    }

    const result = await prisma.$transaction(async (tx: any) => {
      const promo = await tx.promoCode.findFirst({ where: { code } })
      if (!promo) throw new Error('Invalid promo code')

      const user = await tx.user.findUnique({ where: { id: session.user.id } })
      if (!user) throw new Error('User not found')

      const dejaUtilise = await tx.promoRedemption.findFirst({
        where: { promoCodeId: promo.id, userId: session.user.id },
      })
      if (dejaUtilise) throw new Error('Promo code already used')

      const now = new Date()
      const validFrom = asDate(promo.validFrom)
      const validUntil = asDate(promo.validUntil)
      if (!promo.isActive || (validFrom && now < validFrom) || (validUntil && now > validUntil)) {
        throw new Error('Promo code expired or inactive')
      }
      if (promo.requiredPlan && user.plan !== promo.requiredPlan) {
        throw new Error(`This code requires the ${promo.requiredPlan} plan`)
      }
      if (promo.maxUses != null && Number(promo.currentUses || 0) >= Number(promo.maxUses)) {
        throw new Error("Limite d'utilisation atteinte")
      }

      let days: number
      if (promo.discountType === 'fixed_days') days = Number(promo.discountValue)
      else if (promo.discountType === 'percentage') days = Math.round(Number(promo.discountValue) * 0.3)
      else throw new Error('Invalid promotion type')
      if (!Number.isInteger(days) || days <= 0 || days > 3650) throw new Error('Invalid promotion')

      // Un Premium encore valide est prolonge, il n est pas remis a zero.
      const currentExpiry = asDate(user.planExpiresAt)
      const baseDate = user.plan === 'premium' && currentExpiry && currentExpiry > now ? currentExpiry : now
      const newExpiry = new Date(baseDate)
      newExpiry.setUTCDate(newExpiry.getUTCDate() + days)

      await tx.user.update({
        where: { id: session.user.id },
        data: { plan: 'premium', planExpiresAt: newExpiry },
      })
      await tx.promoRedemption.create({
        data: {
          promoCodeId: promo.id,
          userId: session.user.id,
          redeemedAt: now,
        },
      })
      await tx.promoCode.update({
        where: { id: promo.id },
        data: { currentUses: Number(promo.currentUses || 0) + 1 },
      })

      return {
        success: true,
        message: `${days} days of Premium added to your account!`,
        newPlan: 'premium',
        newExpiry,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de l’utilisation du code promo:', error)
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
