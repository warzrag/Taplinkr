import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyExistingUsers() {
  try {
    // Mettre à jour tous les utilisateurs existants pour qu'ils soient vérifiés
    const result = await prisma.user.updateMany({
      where: {
        emailVerified: false
      },
      data: {
        emailVerified: true
      }
    })
    
    console.log(`✅ ${result.count} utilisateur(s) ont été marqués comme vérifiés`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyExistingUsers()