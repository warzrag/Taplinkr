import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { errorTracker } from '@/lib/error-tracker'

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    // Seuls les admins peuvent voir les erreurs
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || undefined
    const severity = searchParams.get('severity') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50

    const errors = errorTracker.getErrors({ type, severity, limit })

    return NextResponse.json({
      count: errors.length,
      errors
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors de la récupération des logs' 
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Log l'erreur côté client
    errorTracker.logError({
      ...body,
      type: 'client',
      timestamp: new Date()
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors de l\'enregistrement' 
    }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 })
    }

    errorTracker.clearErrors()

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Erreur lors de la suppression' 
    }, { status: 500 })
  }
}