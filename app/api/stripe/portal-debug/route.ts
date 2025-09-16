import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { createPortalSession } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const debug: any = {
    host: request.headers.get('host'),
    hasSession: false,
    user: null,
    error: null,
    stripeError: null
  }

  try {
    const session = await getServerSession(authOptions)
    debug.hasSession = !!session
    debug.sessionId = session?.user?.id
    
    if (!session?.user?.id) {
      debug.error = 'No session'
      return NextResponse.json({ debug }, { status: 401 })
    }

    // Récupérer l'utilisateur avec l'ID Stripe Customer
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { 
        id: true,
        email: true,
        stripeCustomerId: true,
        plan: true 
      }
    })
    
    debug.user = user

    if (!user?.stripeCustomerId) {
      debug.error = 'No Stripe customer ID'
      return NextResponse.json({ debug }, { status: 404 })
    }

    // URL de retour
    const host = request.headers.get('host') || 'taplinkr.com'
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const returnUrl = `${protocol}://${host}/dashboard/billing`
    
    debug.returnUrl = returnUrl

    // Créer la session du portail Stripe
    try {
      const portalSession = await createPortalSession(
        user.stripeCustomerId,
        returnUrl
      )
      
      return NextResponse.json({ 
        url: portalSession.url,
        debug 
      })
    } catch (stripeError: any) {
      debug.stripeError = {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code
      }
      throw stripeError
    }
  } catch (error: any) {
    debug.finalError = error.message
    return NextResponse.json({ debug }, { status: 500 })
  }
}