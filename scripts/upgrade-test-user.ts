import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function upgradeUser() {
  try {
    // Trouver un utilisateur de test
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: { contains: 'test' } },
          { username: { contains: 'test' } }
        ]
      }
    })

    if (!user) {
      console.log('❌ Aucun utilisateur de test trouvé')
      process.exit(1)
    }

    // Upgrade vers Premium
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'premium',
        planExpiresAt: null // Pas d'expiration
      }
    })

    console.log('✅ Utilisateur upgradé vers Premium:')
    console.log('📧 Email:', updatedUser.email)
    console.log('📦 Plan:', updatedUser.plan)
    console.log('👤 Username:', updatedUser.username)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

upgradeUser()