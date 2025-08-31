// Test pour vérifier les données dans les différentes tables
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: 'postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
  ssl: {
    rejectUnauthorized: false
  }
})

async function test() {
  console.log('🔍 Vérification des tables et des données...\n')

  try {
    // Vérifier la table "links" (minuscules)
    console.log('📋 Table "links" (minuscules):')
    try {
      const linksResult = await pool.query('SELECT * FROM links LIMIT 5')
      console.log(`  ✅ ${linksResult.rowCount} liens trouvés`)
      if (linksResult.rows.length > 0) {
        console.log('  Premier lien:', {
          id: linksResult.rows[0].id,
          title: linksResult.rows[0].title,
          user_id: linksResult.rows[0].user_id
        })
      }
    } catch (e) {
      console.log('  ❌ Erreur:', e.message)
    }

    // Vérifier la table "Link" (majuscule)
    console.log('\n📋 Table "Link" (majuscule):')
    try {
      const linkResult = await pool.query('SELECT * FROM "Link" LIMIT 5')
      console.log(`  ✅ ${linkResult.rowCount} liens trouvés`)
      if (linkResult.rows.length > 0) {
        console.log('  Premier lien:', linkResult.rows[0])
      }
    } catch (e) {
      console.log('  ❌ Erreur:', e.message)
    }

    // Vérifier la table "multi_links"
    console.log('\n📋 Table "multi_links":')
    try {
      const multiLinksResult = await pool.query('SELECT * FROM multi_links LIMIT 5')
      console.log(`  ✅ ${multiLinksResult.rowCount} multi-liens trouvés`)
    } catch (e) {
      console.log('  ❌ Erreur:', e.message)
    }

    // Vérifier la structure de la table "links"
    console.log('\n📋 Structure de la table "links":')
    try {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'links'
        ORDER BY ordinal_position
      `)
      console.log('  Colonnes:')
      columnsResult.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
      })
    } catch (e) {
      console.log('  ❌ Erreur:', e.message)
    }

    // Vérifier la structure de la table "Link"
    console.log('\n📋 Structure de la table "Link":')
    try {
      const columnsResult = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'Link'
        ORDER BY ordinal_position
      `)
      console.log('  Colonnes:')
      columnsResult.rows.forEach(col => {
        console.log(`    - ${col.column_name} (${col.data_type}) ${col.is_nullable === 'NO' ? 'NOT NULL' : ''}`)
      })
    } catch (e) {
      console.log('  ❌ Erreur:', e.message)
    }

    // Vérifier les utilisateurs et leurs liens
    console.log('\n📋 Utilisateurs et leurs liens:')
    const usersResult = await pool.query('SELECT id, email FROM "User"')
    for (const user of usersResult.rows) {
      console.log(`\n  Utilisateur: ${user.email}`)
      
      // Dans la table Link
      const linkCount = await pool.query('SELECT COUNT(*) FROM "Link" WHERE "userId" = $1', [user.id])
      console.log(`    - Liens dans "Link": ${linkCount.rows[0].count}`)
      
      // Dans la table links
      try {
        const linksCount = await pool.query('SELECT COUNT(*) FROM links WHERE user_id = $1', [user.id])
        console.log(`    - Liens dans "links": ${linksCount.rows[0].count}`)
      } catch (e) {
        // Ignorer si la colonne n'existe pas
      }
    }

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  } finally {
    await pool.end()
  }
}

test()