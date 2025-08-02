const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        createdAt: true
      }
    })
    
    console.log('Nombre total d\'utilisateurs:', users.length)
    console.log('\nListe des utilisateurs:')
    users.forEach(user => {
      console.log(`- ${user.email} (@${user.username}) - Role: ${user.role} - Vérifié: ${user.emailVerified ? 'Oui' : 'Non'}`)
    })
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()