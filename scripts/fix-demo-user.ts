import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDemoUser() {
  try {
    console.log('🔍 Analyzing the "Demo User" issue...\n')
    
    // Check all users
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        createdAt: true,
        _count: {
          select: {
            links: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log('📋 All users in the system:')
    allUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. User:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Username: ${user.username}`)
      console.log(`   Display Name: ${user.name}`)
      console.log(`   Created: ${user.createdAt.toISOString()}`)
      console.log(`   Links: ${user._count.links}`)
      
      if (user.name === 'Demo User') {
        console.log(`   ⚠️  THIS USER SHOWS AS "Demo User" - This is the source of the issue!`)
      }
    })

    // Find the demo user specifically
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@getallmylinks.com' }
    })

    if (demoUser) {
      console.log('\n🎯 ISSUE IDENTIFIED:')
      console.log(`The user account "${demoUser.email}" has name="${demoUser.name}"`)
      console.log(`This is why links show "Demo User" - it's the actual user's display name.`)
      console.log('\n💡 SOLUTIONS:')
      console.log('1. Update this user\'s name to their real name')
      console.log('2. Delete this demo account if it\'s not needed')
      console.log('3. Transfer the links to the real user account')
      console.log('\nWould you like to:')
      console.log('- Update the user name? (Change "Demo User" to something else)')
      console.log('- Delete the demo user account?')
      console.log('- Transfer links to another user?')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDemoUser()