import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function makeAdmin(email: string) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: {
        role: 'admin',
        plan: 'business' // Admin gets all features
      }
    })
    
    console.log(`✅ User ${user.email} is now an admin with business plan`)
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Remplace par ton email
const adminEmail = process.argv[2]

if (!adminEmail) {
  console.error('❌ Please provide an email as argument')
  console.log('Usage: npx tsx scripts/make-admin.ts your-email@example.com')
  process.exit(1)
}

makeAdmin(adminEmail)