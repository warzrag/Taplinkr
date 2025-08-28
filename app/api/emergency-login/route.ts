import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

// Route d'urgence pour réinitialiser le mot de passe
export async function POST(request: NextRequest) {
  const prisma = new PrismaClient()
  
  try {
    const { email, newPassword, securityCode } = await request.json()
    
    // Code de sécurité pour éviter les abus
    if (securityCode !== 'TAPLINKR-EMERGENCY-2024') {
      return NextResponse.json({ error: 'Code de sécurité invalide' }, { status: 401 })
    }
    
    // Vérifier que l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }
    
    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    
    // Mettre à jour le mot de passe et donner les droits admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        password: hashedPassword,
        role: 'admin' // Donner les droits admin en même temps
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Mot de passe réinitialisé pour ${email}`,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        role: updatedUser.role
      }
    })
    
  } catch (error) {
    console.error('Erreur emergency-login:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

// GET pour vérifier les utilisateurs existants
export async function GET() {
  const prisma = new PrismaClient()
  
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        createdAt: true
      }
    })
    
    return NextResponse.json({
      totalUsers: users.length,
      users: users.map(u => ({
        email: u.email,
        username: u.username,
        role: u.role,
        created: u.createdAt
      }))
    })
    
  } catch (error) {
    console.error('Erreur list users:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}