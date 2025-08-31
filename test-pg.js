// Test de connexion PostgreSQL directe
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  ssl: {
    rejectUnauthorized: false
  }
})

async function test() {
  console.log('🔍 Test de connexion PostgreSQL directe...\n')

  try {
    // Test 1: Connexion
    console.log('📋 Test 1: Test de connexion...')
    const result = await pool.query('SELECT NOW()')
    console.log('✅ Connexion réussie:', result.rows[0].now)

    // Test 2: Récupérer les liens
    console.log('\n📋 Test 2: Récupération des liens...')
    const linksResult = await pool.query('SELECT * FROM "Link"')
    console.log(`✅ ${linksResult.rows.length} liens trouvés`)
    
    if (linksResult.rows.length > 0) {
      console.log('\nPremier lien:')
      const link = linksResult.rows[0]
      console.log('  - ID:', link.id)
      console.log('  - Titre:', link.title)
      console.log('  - Slug:', link.slug)
      console.log('  - UserId:', link.userId)
    }

    // Test 3: Récupérer les utilisateurs
    console.log('\n📋 Test 3: Récupération des utilisateurs...')
    const usersResult = await pool.query('SELECT id, email, username FROM "User"')
    console.log(`✅ ${usersResult.rows.length} utilisateurs trouvés`)
    
    if (usersResult.rows.length > 0) {
      console.log('\nUtilisateurs:')
      usersResult.rows.forEach(user => {
        console.log(`  - ${user.email} (ID: ${user.id})`)
      })
    }

    // Test 4: Structure des tables
    console.log('\n📋 Test 4: Vérification de la structure...')
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `)
    console.log('Tables disponibles:')
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`)
    })

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await pool.end()
  }
}

test()