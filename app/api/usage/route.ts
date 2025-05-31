import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { checkUsageLimits } from '@/lib/usage'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const usage = await checkUsageLimits(session.user.id)
    
    return NextResponse.json(usage)
  } catch (error) {
    console.error('Usage error:', error)
    return NextResponse.json({ error: 'Erreur lors de la récupération des données d\'usage' }, { status: 500 })
  }
}