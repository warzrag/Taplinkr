import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    const adminEmail = 'admin@linktracker.app'
    const adminPassword = 'Admin123!' // Mot de passe par défaut - À CHANGER EN PRODUCTION
    
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    })
    
    if (existingAdmin) {
      console.log('❗ L\'administrateur existe déjà')
      return
    }
    
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminPassword, 12)
    
    // Créer l'utilisateur admin
    const admin = await prisma.user.create({
      data: {
        name: 'Administrateur',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN'
      }
    })
    
    console.log('✅ Administrateur créé avec succès!')
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Mot de passe:', adminPassword)
    console.log('⚠️  IMPORTANT: Changez ce mot de passe après la première connexion!')
    
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'admin:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()