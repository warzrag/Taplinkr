const { PrismaClient } = require('@prisma/client')

// Utiliser l'URL de production
const DATABASE_URL = process.env.DATABASE_URL

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL
    }
  }
})

async function main() {
  try {
    console.log('🔄 Test de connexion à Supabase...')
    
    // Tester la connexion
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log(`📊 Nombre d'utilisateurs : ${userCount}`)
    
    // Si aucun utilisateur, afficher un message
    if (userCount === 0) {
      console.log('ℹ️  Aucun utilisateur trouvé. La base de données est prête pour la création du premier compte.')
    }
    
  } catch (error) {
    console.error('❌ Erreur :', error.message)
    console.log('\n💡 Solution : Vous devez d\'abord synchroniser votre schéma Prisma avec Supabase.')
    console.log('Exécutez : DATABASE_URL=process.env.DATABASE_URL npx prisma db push')
  } finally {
    await prisma.$disconnect()
  }
}

main()
