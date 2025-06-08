import { prisma } from '../lib/prisma'

async function testApiProfile() {
  console.log('🧪 Test de l\'API /api/profile...\n')

  try {
    // Simuler une requête GET à l'API profile
    const user = await prisma.user.findFirst({
      where: { email: 'demo@getallmylinks.com' },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        image: true,
        bio: true,
        bannerImage: true,
        avatarId: true,
        bannerId: true,
        theme: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundImage: true,
        twitterUrl: true,
        instagramUrl: true,
        linkedinUrl: true,
        youtubeUrl: true,
        tiktokUrl: true,
      }
    })

    console.log('📊 Données de l\'API profile (GET):')
    console.log(JSON.stringify(user, null, 2))

    // Vérifier spécifiquement les champs d'images
    console.log('\n🖼️  État des images:')
    console.log('   image:', user?.image)
    console.log('   bannerImage:', user?.bannerImage)
    console.log('   avatarId:', user?.avatarId)
    console.log('   bannerId:', user?.bannerId)

    // Vérifier si les relations files fonctionnent
    const userWithFiles = await prisma.user.findFirst({
      where: { email: 'demo@getallmylinks.com' },
      include: {
        avatar: true,
        banner: true
      }
    })

    console.log('\n🔗 Relations avec les fichiers:')
    console.log('   avatar file:', userWithFiles?.avatar)
    console.log('   banner file:', userWithFiles?.banner)

  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApiProfile()