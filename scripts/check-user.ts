import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@linktracker.app' },
      include: {
        links: true
      }
    })

    if (user) {
      console.log('✅ Utilisateur trouvé:')
      console.log('📧 Email:', user.email)
      console.log('👤 Username:', user.username)
      console.log('🔒 Password hash:', user.password ? 'Présent' : 'MANQUANT!')
      console.log('🔗 Nombre de liens:', user.links.length)
    } else {
      console.log('❌ Utilisateur demo non trouvé')
    }
    
    // Lister tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        password: true
      }
    })
    
    console.log('\n📋 Tous les utilisateurs:')
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.username}) - Password: ${u.password ? 'OK' : 'MANQUANT'}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUser()