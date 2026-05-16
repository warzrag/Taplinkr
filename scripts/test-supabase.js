const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

async function testSupabase() {
  try {
    console.log('🔄 Test de connexion à Supabase...')
    
    // Tester la connexion
    await prisma.$connect()
    console.log('✅ Connexion réussie !')
    
    // Compter les tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('\n📊 Tables trouvées :')
    tables.forEach(t => console.log(`  - ${t.table_name}`))
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count()
    console.log(`\n👥 Nombre d'utilisateurs : ${userCount}`)
    
  } catch (error) {
    console.error('❌ Erreur :', error.message)
    console.log('\nDétails :', error)
  } finally {
    await prisma.$disconnect()
  }
}

testSupabase()
