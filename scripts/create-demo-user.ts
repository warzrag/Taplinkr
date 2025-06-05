import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createDemoUser() {
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('demo123', 12)

    // Créer l'utilisateur demo
    const user = await prisma.user.upsert({
      where: { username: 'demo' },
      update: {},
      create: {
        email: 'demo@getallmylinks.com',
        password: hashedPassword,
        username: 'demo',
        name: 'Utilisateur Démo',
        links: {
          create: [
            {
              slug: 'mon-site-web',
              url: 'https://example.com',
              title: 'Mon Site Web Personnel',
              description: 'Découvrez mon portfolio et mes projets',
              type: 'Website',
              shield: false,
              isActive: true
            },
            {
              slug: 'youtube-channel',
              url: 'https://youtube.com/@demo',
              title: 'Ma Chaîne YouTube',
              description: 'Tutoriels et contenus créatifs',
              type: 'Social Media',
              shield: false,
              isActive: true
            },
            {
              slug: 'instagram-profile',
              url: 'https://instagram.com/demo',
              title: 'Instagram',
              description: 'Suivez-moi pour du contenu quotidien',
              type: 'Social Media',
              shield: false,
              isActive: true
            },
            {
              slug: 'github-projects',
              url: 'https://github.com/demo',
              title: 'Mes Projets GitHub',
              description: 'Code open source et projets techniques',
              type: 'Portfolio',
              shield: true,
              isActive: true
            },
            {
              slug: 'blog-articles',
              url: 'https://medium.com/@demo',
              title: 'Mon Blog',
              description: 'Articles et réflexions sur la tech',
              type: 'Blog',
              shield: false,
              isActive: true
            }
          ]
        }
      }
    })

    console.log('✅ Utilisateur demo créé avec succès !')
    console.log('📧 Email: demo@getallmylinks.com')
    console.log('🔑 Mot de passe: demo123')
    console.log('🔗 Profil public: http://localhost:3000/demo')
    console.log('🎯 Liens de test:')
    console.log('   - http://localhost:3000/mon-site-web')
    console.log('   - http://localhost:3000/youtube-channel')
    console.log('   - http://localhost:3000/github-projects (avec shield)')
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()