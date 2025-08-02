import { prisma } from '../lib/prisma'

async function deleteUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }

    await prisma.user.delete({
      where: { email }
    })

    console.log('✅ Utilisateur supprimé:', email)
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter avec l'email passé en argument
const email = process.argv[2]
if (!email) {
  console.log('Usage: npx ts-node scripts/delete-user.ts email@example.com')
  process.exit(1)
}

deleteUser(email)