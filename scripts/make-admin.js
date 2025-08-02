const { PrismaClient } = require('@prisma/client')

async function makeAdmin() {
  const prisma = new PrismaClient()
  
  try {
    const email = process.argv[2]
    
    if (!email) {
      console.log('❌ Usage: node scripts/make-admin.js <email>')
      console.log('Exemple: node scripts/make-admin.js votre-email@example.com')
      return
    }
    
    console.log(`🔄 Recherche de l'utilisateur ${email}...`)
    
    const user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      console.log(`❌ Aucun utilisateur trouvé avec l'email ${email}`)
      return
    }
    
    console.log(`✅ Utilisateur trouvé : ${user.username}`)
    console.log(`📋 Rôle actuel : ${user.role}`)
    
    if (user.role === 'admin') {
      console.log('ℹ️ Cet utilisateur est déjà admin')
      return
    }
    
    console.log('🔄 Mise à jour du rôle en admin...')
    
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { 
        role: 'admin',
        plan: 'premium' // Admin a automatiquement le plan premium
      }
    })
    
    console.log('✅ Utilisateur mis à jour avec succès !')
    console.log(`👤 Username : ${updatedUser.username}`)
    console.log(`📧 Email : ${updatedUser.email}`)
    console.log(`👑 Rôle : ${updatedUser.role}`)
    console.log(`💎 Plan : ${updatedUser.plan}`)
    
  } catch (error) {
    console.error('❌ Erreur :', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

makeAdmin()