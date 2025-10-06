const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkViews() {
  try {
    const links = await pool.query(`
      SELECT slug, title, views, clicks 
      FROM links 
      ORDER BY "createdAt" DESC
    `)

    console.log('\n📊 Statistiques des liens:\n')
    links.rows.forEach((link, i) => {
      console.log(`${i+1}. ${link.title} (${link.slug})`)
      console.log(`   👁️ Vues: ${link.views} | 👆 Clics: ${link.clicks}`)
    })

    const totalViews = await pool.query(`
      SELECT COUNT(*) as total 
      FROM clicks 
      WHERE "multiLinkId" IS NULL
    `)

    console.log(`\n📈 Total vues enregistrées dans clicks: ${totalViews.rows[0].total}`)

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkViews()
