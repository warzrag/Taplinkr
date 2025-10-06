const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function shareAllFolders() {
  try {
    console.log('🔍 Recherche des dossiers à partager...\n')

    // Récupérer l'utilisateur principal (toi)
    const mainUser = await prisma.user.findUnique({
      where: { email: 'ivorraflorentt@gmail.com' },
      select: { id: true, teamId: true, email: true }
    })

    if (!mainUser) {
      console.log('❌ Utilisateur principal non trouvé')
      return
    }

    console.log('✅ Utilisateur trouvé:', mainUser.email)
    console.log('   TeamId:', mainUser.teamId || 'AUCUNE ÉQUIPE')

    if (!mainUser.teamId) {
      console.log('❌ L\'utilisateur n\'a pas d\'équipe')
      return
    }

    // Récupérer tous les dossiers de l'utilisateur qui ne sont pas encore partagés
    const folders = await prisma.folder.findMany({
      where: {
        userId: mainUser.id,
        teamShared: false
      },
      select: {
        id: true,
        name: true,
        description: true
      }
    })

    console.log(`\n📁 ${folders.length} dossier(s) à partager:\n`)

    if (folders.length === 0) {
      console.log('✅ Tous les dossiers sont déjà partagés ou aucun dossier trouvé')
      return
    }

    // Partager chaque dossier
    for (const folder of folders) {
      console.log(`   Partage: ${folder.name}`)

      await prisma.folder.update({
        where: { id: folder.id },
        data: {
          teamShared: true,
          teamId: mainUser.teamId,
          originalOwnerId: mainUser.id
        }
      })
    }

    console.log('\n✅ Tous les dossiers ont été partagés avec l\'équipe!')

    // Vérification
    const sharedFolders = await prisma.folder.findMany({
      where: {
        teamId: mainUser.teamId,
        teamShared: true
      },
      select: {
        id: true,
        name: true
      }
    })

    console.log(`\n📊 Total des dossiers partagés: ${sharedFolders.length}`)
    sharedFolders.forEach((folder, i) => {
      console.log(`   ${i + 1}. ${folder.name}`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

shareAllFolders()
