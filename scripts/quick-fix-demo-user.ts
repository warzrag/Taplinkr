import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function quickFixDemoUser() {
  try {
    console.log('🎯 Quick Fix: Update Demo User Name\n')
    
    // Get command line argument for new name
    const newName = process.argv[2]
    
    if (!newName) {
      console.log('❌ Please provide a new name as an argument')
      console.log('Example: npx tsx scripts/quick-fix-demo-user.ts "John Smith"')
      console.log('\nOR to delete the demo user entirely:')
      console.log('npx tsx scripts/quick-fix-demo-user.ts DELETE')
      return
    }

    const demoUser = await prisma.user.findUnique({
      where: { email: 'demo@getallmylinks.com' }
    })

    if (!demoUser) {
      console.log('✅ No demo user found - issue may already be resolved')
      return
    }

    if (newName.toUpperCase() === 'DELETE') {
      console.log('🗑️  Deleting demo user and all associated data...')
      await prisma.user.delete({
        where: { email: 'demo@getallmylinks.com' }
      })
      console.log('✅ Demo user account deleted successfully!')
      console.log('All links and associated data have been removed.')
    } else {
      console.log(`📝 Updating user name from "${demoUser.name}" to "${newName}"...`)
      
      const updated = await prisma.user.update({
        where: { email: 'demo@getallmylinks.com' },
        data: { name: newName }
      })
      
      console.log('✅ User name updated successfully!')
      console.log(`👤 New display name: ${updated.name}`)
      console.log(`📧 Email: ${updated.email}`)
      console.log(`🏷️  Username: @${updated.username}`)
      console.log('\n🎉 The "Demo User" issue should now be resolved!')
      console.log('Links will now show the updated name instead of "Demo User"')
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

quickFixDemoUser()