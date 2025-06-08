import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function resolveDemoUserIssue() {
  try {
    console.log('🔧 Demo User Issue Resolution Tool\n')
    
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

    if (!demoUser) {
      console.log('✅ No demo user found. Issue may already be resolved.')
      return
    }

    console.log('📊 Current situation:')
    console.log(`   User: ${demoUser.name} (${demoUser.email})`)
    console.log(`   Username: @${demoUser.username}`)
    console.log(`   Links: ${demoUser.links.length}`)
    console.log(`   Created: ${demoUser.createdAt.toISOString()}`)

    if (demoUser.links.length > 0) {
      console.log('\n🔗 Links owned by this demo user:')
      demoUser.links.forEach((link, i) => {
        console.log(`   ${i + 1}. "${link.title}" (/${link.slug}) - ${link.multiLinks.length} destinations`)
      })
    }

    console.log('\n🎯 RESOLUTION OPTIONS:\n')

    // Option 1: Update user's display name
    console.log('Option 1: Update the user\'s display name')
    console.log('   This will change "Demo User" to a real name for this account')
    console.log('   Example: Change to "John Doe" or the real user\'s name')
    console.log('   Command: updateUserName("New Name")\n')

    // Option 2: Delete demo user (if no valuable links)
    console.log('Option 2: Delete the demo user account')
    console.log('   ⚠️  WARNING: This will permanently delete all links and data')
    console.log('   Only use if this is truly test data with no value')
    console.log('   Command: deleteDemoUser()\n')

    // Option 3: Transfer links to admin
    console.log('Option 3: Transfer all links to the admin user')
    console.log('   This moves all links to admin@linktracker.app')
    console.log('   Then deletes the demo user account')
    console.log('   Command: transferLinksToAdmin()\n')

    // Option 4: Create a new real user and transfer
    console.log('Option 4: Create a new user and transfer links')
    console.log('   Creates a new user account with real credentials')
    console.log('   Transfers all links to the new account')
    console.log('   Command: createRealUserAndTransfer("real@email.com", "RealName")\n')

    console.log('🚀 RECOMMENDED SOLUTION:')
    console.log('If the user is a real person using the app:')
    console.log('   - Use Option 1 to update their display name')
    console.log('   - Ask them to update their profile with real information')
    console.log('\nIf this is just test data:')
    console.log('   - Use Option 2 to delete the demo user')
    console.log('   - Or Option 3 to transfer valuable links to admin first')

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Helper function to update user name
async function updateUserName(newName: string) {
  try {
    const updated = await prisma.user.update({
      where: { email: 'demo@getallmylinks.com' },
      data: { name: newName }
    })
    console.log(`✅ User name updated to: ${updated.name}`)
  } catch (error) {
    console.error('❌ Error updating name:', error)
  }
}

// Helper function to delete demo user
async function deleteDemoUser() {
  try {
    // Links will be cascade deleted due to schema constraints
    await prisma.user.delete({
      where: { email: 'demo@getallmylinks.com' }
    })
    console.log('✅ Demo user and all associated data deleted')
  } catch (error) {
    console.error('❌ Error deleting user:', error)
  }
}

// Helper function to transfer links to admin
async function transferLinksToAdmin() {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@linktracker.app' }
    })
    
    if (!admin) {
      console.log('❌ Admin user not found')
      return
    }

    const result = await prisma.link.updateMany({
      where: { user: { email: 'demo@getallmylinks.com' } },
      data: { userId: admin.id }
    })

    console.log(`✅ Transferred ${result.count} links to admin`)
    
    // Now delete the demo user
    await deleteDemoUser()
  } catch (error) {
    console.error('❌ Error transferring links:', error)
  }
}

// Helper function to create real user and transfer
async function createRealUserAndTransfer(email: string, name: string, password: string = 'ChangeMe123!') {
  try {
    const hashedPassword = await bcrypt.hash(password, 12)
    
    // Generate username from email
    const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '')
    let username = baseUsername
    let counter = 1
    
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${baseUsername}${counter}`
      counter++
    }

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        username,
        password: hashedPassword
      }
    })

    console.log(`✅ Created new user: ${newUser.name} (${newUser.email})`)
    console.log(`🔑 Temporary password: ${password}`)

    // Transfer links
    const result = await prisma.link.updateMany({
      where: { user: { email: 'demo@getallmylinks.com' } },
      data: { userId: newUser.id }
    })

    console.log(`✅ Transferred ${result.count} links to new user`)
    
    // Delete demo user
    await deleteDemoUser()
    
    console.log('\n🎉 Process complete!')
    console.log(`New user can login with: ${email} / ${password}`)
    console.log('⚠️  Make sure to change the password after first login')

  } catch (error) {
    console.error('❌ Error creating user and transferring:', error)
  }
}

resolveDemoUserIssue()