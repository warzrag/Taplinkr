import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { FieldValue } from 'firebase-admin/firestore'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/firebase-admin'

function asDate(value: unknown): Date | null {
  if (!value) return null
  if (typeof value === 'object' && value !== null && 'toDate' in value) {
    return (value as { toDate(): Date }).toDate()
  }
  const date = new Date(value as string | number | Date)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })

    const code = String((await request.json()).code || '').trim().toUpperCase()
    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 })
    }

    const promoQuery = await db.collection('promoCodes').where('code', '==', code).limit(1).get()
    if (promoQuery.empty) return NextResponse.json({ error: 'Code promo invalide' }, { status: 400 })

    const promoRef = promoQuery.docs[0].ref
    const userRef = db.collection('users').doc(session.user.id)
    const redemptionRef = db.collection('promoRedemptions').doc(`${promoRef.id}_${session.user.id}`)

    const result = await db.runTransaction(async (transaction) => {
      const [promoSnap, userSnap, redemptionSnap] = await Promise.all([
        transaction.get(promoRef),
        transaction.get(userRef),
        transaction.get(redemptionRef),
      ])

      if (!promoSnap.exists) throw new Error('Code promo invalide')
      if (!userSnap.exists) throw new Error('Utilisateur introuvable')
      if (redemptionSnap.exists) throw new Error('Code déjà utilisé')

      const promo = promoSnap.data()!
      const user = userSnap.data()!
      const now = new Date()
      const validFrom = asDate(promo.validFrom)
      const validUntil = asDate(promo.validUntil)
      if (!promo.isActive || (validFrom && now < validFrom) || (validUntil && now > validUntil)) {
        throw new Error('Code promo expiré ou inactif')
      }
      if (promo.requiredPlan && user.plan !== promo.requiredPlan) {
        throw new Error(`Ce code nécessite le plan ${promo.requiredPlan}`)
      }
      if (promo.maxUses != null && Number(promo.currentUses || 0) >= Number(promo.maxUses)) {
        throw new Error("Limite d'utilisation atteinte")
      }

      let days: number
      if (promo.discountType === 'fixed_days') days = Number(promo.discountValue)
      else if (promo.discountType === 'percentage') days = Math.round(Number(promo.discountValue) * 0.3)
      else throw new Error('Type de promotion invalide')
      if (!Number.isInteger(days) || days <= 0 || days > 3650) throw new Error('Promotion invalide')

      const currentExpiry = asDate(user.planExpiresAt)
      const baseDate = user.plan === 'premium' && currentExpiry && currentExpiry > now ? currentExpiry : now
      const newExpiry = new Date(baseDate)
      newExpiry.setUTCDate(newExpiry.getUTCDate() + days)

      transaction.set(userRef, { plan: 'premium', planExpiresAt: newExpiry, updatedAt: now }, { merge: true })
      transaction.create(redemptionRef, {
        id: redemptionRef.id,
        promoCodeId: promoRef.id,
        userId: session.user.id,
        redeemedAt: now,
      })
      transaction.update(promoRef, { currentUses: FieldValue.increment(1), updatedAt: now })

      return {
        success: true,
        message: `${days} jours Premium ajoutés à votre compte !`,
        newPlan: 'premium',
        newExpiry,
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Erreur lors de l’utilisation du code promo:', error)
    const message = error instanceof Error ? error.message : 'Erreur serveur'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
