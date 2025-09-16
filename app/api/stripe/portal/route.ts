import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Récupérer l'utilisateur avec l'ID Stripe Customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { stripeCustomerId: true }
    })

    if (!user?.stripeCustomerId) {
      return NextResponse.json({ error: 'Aucun abonnement trouvé' }, { status: 404 })
    }

    // URL de retour - utiliser l'host de la requête pour supporter www et non-www
    const host = request.headers.get('host') || 'taplinkr.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const returnUrl = `${protocol}://${host}/dashboard/billing`

    // Créer la session du portail Stripe
    const portalSession = await createPortalSession(
      user.stripeCustomerId,
      returnUrl
    )

    return NextResponse.json({ url: portalSession.url })
  } catch (error) {
    console.error('Erreur lors de la création du portail:', error)
    return NextResponse.json(
      { error: 'Erreur lors de la création du portail de gestion' },
      { status: 500 }
    )
  }
}