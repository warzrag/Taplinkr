import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        role: true,
        plan: true,
        createdAt: true
      }
    })
    
    console.log('\n📋 Liste des utilisateurs:\n')
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Role: ${user.role || 'user'}`)
      console.log(`   Plan: ${user.plan || 'free'}`)
      console.log(`   Inscrit le: ${user.createdAt.toLocaleDateString('fr-FR')}`)
      console.log('---')
    })
    
    console.log(`\nTotal: ${users.length} utilisateur(s)\n`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listUsers()