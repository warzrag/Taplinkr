import { PrismaClient } from '@prisma/client'
import { getUserPermissions, checkPermission } from '../lib/permissions'

const prisma = new PrismaClient()

async function testTeamCreation() {
  try {
    // Trouver l'utilisateur de test
    const user = await prisma.user.findFirst({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      console.log('❌ Utilisateur test non trouvé')
      return
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      plan: user.plan,
      role: user.role
    })

    // Tester les permissions
    const permissions = getUserPermissions(user)
    console.log('🔑 Permissions:', permissions)

    const hasTeamAccess = checkPermission(permissions, 'hasTeamMembers')
    console.log('🏢 Accès équipe:', hasTeamAccess)

    // Vérifier s'il a déjà une équipe
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: user.id }
    })

    console.log('🏢 Équipe existante:', existingTeam ? 'OUI' : 'NON')

    if (existingTeam) {
      console.log('ℹ️ Équipe existante:', {
        id: existingTeam.id,
        name: existingTeam.name,
        slug: existingTeam.slug
      })
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testTeamCreation()