import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
})

async function fixAdminAccount() {
  try {
    console.log('🔧 Correction du compte admin en production...')
    
    const email = 'admin@taplinkr.com'
    const password = 'Admin123!'
    const hashedPassword = await bcrypt.hash(password, 10)
    
    // Vérifier si le compte existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (existingUser) {
      // Mettre à jour le mot de passe
      const updated = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          emailVerified: true,
          role: 'ADMIN'
        }
      })
      console.log('✅ Compte admin mis à jour:', updated.email)
      console.log('📧 Email:', email)
      console.log('🔑 Mot de passe:', password)
    } else {
      // Créer le compte
      const created = await prisma.user.create({
        data: {
          email,
          username: 'admin',
          password: hashedPassword,
          emailVerified: true,
          role: 'ADMIN'
        }
      })
      console.log('✅ Compte admin créé:', created.email)
      console.log('📧 Email:', email)
      console.log('🔑 Mot de passe:', password)
    }
    
    // Vérifier que le hash fonctionne
    const testUser = await prisma.user.findUnique({
      where: { email }
    })
    
    if (testUser) {
      const isValid = await bcrypt.compare(password, testUser.password)
      console.log('🔐 Vérification du mot de passe:', isValid ? '✅ OK' : '❌ ERREUR')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAdminAccount()