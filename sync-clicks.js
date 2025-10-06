const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function syncClicks() {
  try {
    // Mettre à jour clicks = views pour tous les liens
    const result = await pool.query(`
      UPDATE links 
      SET clicks = views
      WHERE clicks != views
      RETURNING id, title, slug, views, clicks
    `)

    console.log(`\n✅ ${result.rows.length} lien(s) mis à jour:\n`)
    result.rows.forEach((link, i) => {
      console.log(`${i+1}. ${link.title} (${link.slug})`)
      console.log(`   👁️ Vues: ${link.views} | 👆 Clics: ${link.clicks}`)
    })

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

syncClicks()
