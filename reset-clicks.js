const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function resetClicks() {
  try {
    // Reset clicks et views des liens
    const links = await pool.query(`
      UPDATE links 
      SET clicks = 0, views = 0
      RETURNING id, title, slug
    `)

    console.log(`\n✅ ${links.rows.length} lien(s) réinitialisé(s):`)
    links.rows.forEach((link, i) => {
      console.log(`${i+1}. ${link.title} (${link.slug}) - clics: 0`)
    })

    // Reset clicks des multiLinks
    const multiLinks = await pool.query(`
      UPDATE multi_links 
      SET clicks = 0
      RETURNING id, title
    `)

    console.log(`\n✅ ${multiLinks.rows.length} multiLink(s) réinitialisé(s):`)
    multiLinks.rows.forEach((ml, i) => {
      console.log(`${i+1}. ${ml.title} - clics: 0`)
    })

    // Supprimer tous les événements de clics
    const deleted = await pool.query(`
      DELETE FROM clicks
      RETURNING id
    `)

    console.log(`\n✅ ${deleted.rows.length} événement(s) de clic supprimé(s)`)
    console.log('\n🎯 Tous les compteurs sont à 0 !')

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

resetClicks()
