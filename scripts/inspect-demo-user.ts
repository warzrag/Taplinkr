import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function inspectDemoUser() {
  try {
    // Find the demo user
    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@getallmylinks.com' },
      include: {
        links: {
          include: {
            multiLinks: true
          }
        }
      }
    })

    if (demoUser) {
      console.log('✅ Demo User found:')
      console.log('📧 Email:', demoUser.email)
      console.log('👤 Username:', demoUser.username)
      console.log('🏷️  Name:', demoUser.name)
      console.log('📝 Bio:', demoUser.bio)
      console.log('🎨 Theme:', demoUser.theme)
      console.log('🔗 Links:', demoUser.links.length)
      
      console.log('\n=== LINKS DETAILS ===')
      demoUser.links.forEach((link, index) => {
        console.log(`\nLink ${index + 1}:`)
        console.log(`  Title: ${link.title}`)
        console.log(`  Slug: ${link.slug}`)
        console.log(`  Active: ${link.isActive}`)
        console.log(`  User data should show: Name="${demoUser.name}", Username="${demoUser.username}"`)
        console.log(`  Public URL: http://localhost:3000/${link.slug}`)
      })
    } else {
      console.log('❌ Demo user not found')
    }
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

inspectDemoUser()