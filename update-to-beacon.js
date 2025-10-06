const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function updateToBeacon() {
  try {
    const result = await pool.query(`
      UPDATE links 
      SET "profileStyle" = 'beacon', "updatedAt" = NOW()
      WHERE "profileStyle" = 'circle' OR "profileStyle" IS NULL
      RETURNING id, title, slug, "profileStyle"
    `)

    console.log(`\n✅ ${result.rows.length} lien(s) mis à jour vers mode beacon:\n`)
    
    result.rows.forEach((link, i) => {
      console.log(`${i + 1}. ${link.title} (${link.slug}) - profileStyle: ${link.profileStyle}`)
    })

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

updateToBeacon()
