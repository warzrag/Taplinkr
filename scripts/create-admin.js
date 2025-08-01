const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@linktracker.com',
        username: 'admin',
        password: hashedPassword,
        name: 'Administrateur',
        role: 'admin',
        plan: 'premium',
        emailVerified: true,
      }
    })
    
    console.log('✅ Compte admin créé avec succès!')
    console.log('📧 Email: admin@linktracker.com')
    console.log('🔑 Mot de passe: admin123')
    console.log('👤 Username: admin')
    console.log('⚡ Rôle: admin')
    console.log('💎 Plan: premium')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création du compte admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()