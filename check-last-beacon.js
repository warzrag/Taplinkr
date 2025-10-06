const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkLastBeacon() {
  try {
    const result = await pool.query(`
      SELECT id, title, slug, "profileStyle", "profileImage", "createdAt" 
      FROM links 
      ORDER BY "createdAt" DESC 
      LIMIT 1
    `)

    if (result.rows.length === 0) {
      console.log('Aucun lien trouvé')
    } else {
      console.log('\n📋 Dernier lien créé:')
      console.log('Title:', result.rows[0].title)
      console.log('Slug:', result.rows[0].slug)
      console.log('ProfileStyle:', result.rows[0].profileStyle)
      console.log('ProfileImage:', result.rows[0].profileImage ? 'Oui' : 'Non')
      console.log('Created:', result.rows[0].createdAt)
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkLastBeacon()
