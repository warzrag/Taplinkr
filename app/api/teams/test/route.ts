import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// API de test simplifiée
export async function POST(request: NextRequest) {
  console.log('🚀 API Test Teams - Début')
  
  try {
    // Test 1: Session
    console.log('📋 Test 1: Récupération session...')
    const session = await getServerSession(authOptions)
    console.log('✅ Session:', session?.user?.id ? 'OK' : 'FAIL')
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Session manquante', step: 'session' }, { status: 401 })
    }

    // Test 2: Body parsing
    console.log('📋 Test 2: Parsing body...')
    const body = await request.json()
    console.log('✅ Body:', body)

    // Test 3: Database access
    console.log('📋 Test 3: Accès base de données...')
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })
    console.log('✅ User trouvé:', user ? 'OK' : 'FAIL')

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé', step: 'user' }, { status: 404 })
    }

    // Test 4: Team creation simple
    console.log('📋 Test 4: Création équipe simple...')
    const team = await prisma.team.create({
      data: {
        name: body.name || 'Test Team',
        slug: `test-${Date.now()}`,
        ownerId: session.user.id,
      }
    })
    console.log('✅ Équipe créée:', team.id)

    return NextResponse.json({ 
      success: true, 
      team: { id: team.id, name: team.name },
      user: { id: user.id, plan: user.plan }
    })

  } catch (error) {
    console.error('❌ Erreur dans test API:', error)
    return NextResponse.json({ 
      error: 'Erreur test API', 
      details: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 })
  }
}