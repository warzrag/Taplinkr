const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:FlO1998florent1998@db.dkwgorynhgnmldzbhhrb.supabase.co:5432/postgres',
  ssl: {
    rejectUnauthorized: false
  }
})

async function testConnection() {
  try {
    console.log('🔄 Tentative de connexion à Supabase...')
    await client.connect()
    console.log('✅ Connexion réussie !')
    
    const result = await client.query('SELECT NOW()')
    console.log('⏰ Heure serveur :', result.rows[0].now)
    
    await client.end()
  } catch (error) {
    console.error('❌ Erreur de connexion :', error.message)
    console.log('\n💡 Vérifiez dans Supabase :')
    console.log('1. Que la base de données est active (pas en pause)')
    console.log('2. Settings → Database → Connection pooling')
  }
}

testConnection()