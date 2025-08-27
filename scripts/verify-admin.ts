import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
})

async function verifyAdmin() {
  console.log('🔍 Vérification du compte admin...\n')
  
  try {
    // Lister tous les comptes admin
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: {
        id: true,
        email: true,
        username: true,
        emailVerified: true,
        createdAt: true
      }
    })
    
    console.log(`📊 Nombre de comptes admin trouvés: ${admins.length}`)
    
    for (const admin of admins) {
      console.log('\n👤 Compte admin:')
      console.log(`   Email: ${admin.email}`)
      console.log(`   Username: ${admin.username}`)
      console.log(`   Email vérifié: ${admin.emailVerified ? '✅' : '❌'}`)
      console.log(`   Créé le: ${admin.createdAt.toLocaleString()}`)
    }
    
    // Vérifier spécifiquement admin@taplinkr.com
    console.log('\n🔐 Test du compte admin@taplinkr.com...')
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@taplinkr.com' }
    })
    
    if (adminUser) {
      const testPassword = 'Admin123!'
      const isValid = await bcrypt.compare(testPassword, adminUser.password)
      
      console.log(`   ✅ Compte trouvé`)
      console.log(`   Mot de passe Admin123! valide: ${isValid ? '✅' : '❌'}`)
      
      if (!isValid) {
        console.log('\n🔧 Réparation du mot de passe...')
        const newHash = await bcrypt.hash(testPassword, 10)
        await prisma.user.update({
          where: { email: 'admin@taplinkr.com' },
          data: {
            password: newHash,
            emailVerified: true,
            role: 'ADMIN'
          }
        })
        console.log('   ✅ Mot de passe réparé!')
      }
    } else {
      console.log('   ❌ Compte non trouvé - Création...')
      const hashedPassword = await bcrypt.hash('Admin123!', 10)
      await prisma.user.create({
        data: {
          email: 'admin@taplinkr.com',
          username: 'admin',
          password: hashedPassword,
          emailVerified: true,
          role: 'ADMIN'
        }
      })
      console.log('   ✅ Compte créé!')
    }
    
    console.log('\n✅ Vérification terminée!')
    console.log('\n📝 Vous pouvez vous connecter avec:')
    console.log('   Email: admin@taplinkr.com')
    console.log('   Mot de passe: Admin123!')
    console.log('   URL: https://www.taplinkr.com/auth/signin')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyAdmin()