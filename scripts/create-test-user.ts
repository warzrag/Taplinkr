import { prisma } from '../lib/prisma'
import { hash } from 'bcryptjs'

async function createTestUser() {
  try {
    // Créer un utilisateur de test avec le plan gratuit
    const hashedPassword = await hash('testuser123', 12)
    
    // Générer un username unique avec timestamp
    const timestamp = Date.now()
    const username = `testuser${timestamp}`
    const email = `test${timestamp}@example.com`
    
    const user = await prisma.user.create({
      data: {
        email: email,
        username: username,
        name: 'Test User Gratuit',
        password: hashedPassword,
        emailVerified: true,
        role: 'user',
        plan: 'free',
      }
    })
    
    console.log('✅ Utilisateur de test créé avec succès !')
    console.log('Email:', user.email)
    console.log('Mot de passe: testuser123')
    console.log('Plan:', user.plan)
    console.log('Rôle:', user.role)
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur de test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser()