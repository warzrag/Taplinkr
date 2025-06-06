import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { analyticsService } from '@/lib/analytics-service'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    // Verify link ownership
    const link = await prisma.link.findUnique({
      where: { 
        id: params.linkId,
        userId: session.user.id
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const analytics = await analyticsService.getAnalytics(params.linkId, {
      start: startDate,
      end: endDate
    })

    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Erreur lors de la récupération des analytics:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}