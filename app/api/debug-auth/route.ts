import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Auth API appelée')
    
    // Test 1: Vérifier la connexion DB
    const userCount = await prisma.user.count()
    console.log('✅ Connexion DB OK, users:', userCount)
    
    // Test 2: Récupérer l'utilisateur test
    const testUser = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })
    
    if (!testUser) {
      return NextResponse.json({
        success: false,
        error: 'Utilisateur test non trouvé',
        dbConnection: true,
        userCount
      })
    }
    
    // Test 3: Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare('password123', testUser.password)
    
    return NextResponse.json({
      success: true,
      dbConnection: true,
      userCount,
      testUser: {
        id: testUser.id,
        email: testUser.email,
        username: testUser.username,
        emailVerified: testUser.emailVerified,
        hasPassword: !!testUser.password,
        passwordValid: isPasswordValid
      }
    })
    
  } catch (error: any) {
    console.error('❌ Debug Auth Error:', error)
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 })
  }
}