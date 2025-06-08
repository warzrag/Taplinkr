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
        email: 'demo@linktracker.app',
        password: hashedPassword,
        username: 'demo',
        name: 'Utilisateur Démo',
        links: {
          create: [
            {
              slug: 'demo-links',
              title: 'Mes Liens Demo',
              description: 'Collection de liens de démonstration',
              icon: '🔗',
              shield: false,
              isActive: true,
              clicks: 0,
              multiLinks: {
                create: [
                  {
                    title: 'Mon Site Web Personnel',
                    url: 'https://example.com',
                    description: 'Découvrez mon portfolio et mes projets',
                    icon: '🌐',
                    order: 1,
                    clicks: 0
                  },
                  {
                    title: 'Ma Chaîne YouTube',
                    url: 'https://youtube.com/@demo',
                    description: 'Tutoriels et contenus créatifs',
                    icon: '🎬',
                    order: 2,
                    clicks: 0
                  },
                  {
                    title: 'Instagram',
                    url: 'https://instagram.com/demo',
                    description: 'Suivez-moi pour du contenu quotidien',
                    icon: '📸',
                    order: 3,
                    clicks: 0
                  },
                  {
                    title: 'Mes Projets GitHub',
                    url: 'https://github.com/demo',
                    description: 'Code open source et projets techniques',
                    icon: '💻',
                    order: 4,
                    clicks: 0
                  }
                ]
              }
            }
          ]
        }
      }
    })

    console.log('✅ Utilisateur demo créé avec succès !')
    console.log('📧 Email: demo@linktracker.app')
    console.log('🔑 Mot de passe: demo123')
    console.log('🔗 Profil public: http://localhost:3001/demo')
    console.log('🎯 Liens de test:')
    console.log('   - http://localhost:3001/demo-links')
  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'utilisateur demo:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoUser()