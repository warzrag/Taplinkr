const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkLinks() {
  try {
    const result = await pool.query('SELECT id, title, slug, "createdAt" FROM links ORDER BY "createdAt" DESC')

    console.log(`\n📊 Total liens dans PostgreSQL: ${result.rows.length}`)

    if (result.rows.length === 0) {
      console.log('✅ Aucun lien trouvé - base de données vide')
    } else {
      console.log('\n📋 Liens trouvés:')
      result.rows.forEach((link, index) => {
        console.log(`${index + 1}. ${link.title} (${link.slug}) - créé le ${link.createdAt}`)
      })
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkLinks()
