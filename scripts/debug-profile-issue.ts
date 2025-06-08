import { prisma } from '../lib/prisma'

async function debugProfileIssue() {
  console.log('🔍 Diagnostic du problème de sauvegarde des photos...\n')

  try {
    // 1. Vérifier l'utilisateur actuel
    const user = await prisma.user.findFirst({
      where: {
        email: 'demo@getallmylinks.com'
      },
      include: {
        avatar: true,
        banner: true,
        files: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    })

    if (!user) {
      console.log('❌ Utilisateur demo non trouvé')
      return
    }

    console.log('👤 État actuel du profil:')
    console.log('   Email:', user.email)
    console.log('   Nom:', user.name)
    console.log('   Image URL:', user.image)
    console.log('   Banner URL:', user.bannerImage)
    console.log('   Avatar ID:', user.avatarId)
    console.log('   Banner ID:', user.bannerId)
    console.log('   Avatar File:', user.avatar ? user.avatar.url : 'Aucun')
    console.log('   Banner File:', user.banner ? user.banner.url : 'Aucun')
    console.log()

    // 2. Vérifier les fichiers récents de l'utilisateur
    console.log('📁 5 derniers fichiers uploadés:')
    user.files.forEach((file, index) => {
      console.log(`   ${index + 1}. ${file.originalName} (${file.id})`)
      console.log(`      URL: ${file.url}`)
      console.log(`      Créé: ${file.createdAt}`)
    })
    console.log()

    // 3. Tester une mise à jour
    console.log('🧪 Test de mise à jour...')
    
    const latestFile = user.files[0]
    if (latestFile) {
      console.log(`   Utilisation du fichier: ${latestFile.originalName}`)
      
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          image: latestFile.url,
          avatarId: latestFile.id
        }
      })
      
      console.log('✅ Mise à jour réussie:')
      console.log('   Nouvelle image:', updatedUser.image)
      console.log('   Nouvel avatar ID:', updatedUser.avatarId)
    } else {
      console.log('   ⚠️  Aucun fichier disponible pour le test')
    }

    // 4. Vérifier la persistance
    console.log('\n🔄 Vérification de la persistance...')
    const freshUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        image: true,
        bannerImage: true,
        avatarId: true,
        bannerId: true
      }
    })
    
    console.log('   Image:', freshUser?.image)
    console.log('   Banner:', freshUser?.bannerImage)
    console.log('   Avatar ID:', freshUser?.avatarId)
    console.log('   Banner ID:', freshUser?.bannerId)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugProfileIssue()