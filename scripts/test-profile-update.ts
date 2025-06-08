import { prisma } from '../lib/prisma'

async function testProfileUpdate() {
  console.log('🧪 Test de mise à jour du profil...')

  try {
    // Trouver l'utilisateur actuel
    const user = await prisma.user.findFirst({
      where: {
        email: 'demo@getallmylinks.com'
      }
    })

    if (!user) {
      console.log('❌ Utilisateur demo non trouvé')
      return
    }

    console.log('👤 Utilisateur trouvé:', {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      bannerImage: user.bannerImage,
      avatarId: user.avatarId,
      bannerId: user.bannerId
    })

    // Test de mise à jour avec des URLs d'images
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        image: 'https://picsum.photos/200/200?random=1',
        bannerImage: 'https://picsum.photos/800/200?random=2'
      }
    })

    console.log('✅ Profil mis à jour avec succès:', {
      image: updatedUser.image,
      bannerImage: updatedUser.bannerImage
    })

    // Vérifier que les changements sont persistés
    const verifyUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        image: true,
        bannerImage: true,
        avatarId: true,
        bannerId: true
      }
    })

    console.log('🔍 Vérification après sauvegarde:', verifyUser)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testProfileUpdate()