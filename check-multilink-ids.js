const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkIds() {
  try {
    const result = await pool.query(`
      SELECT id, title, "parentLinkId"
      FROM multi_links
      ORDER BY "createdAt" DESC
    `)

    console.log('\n📋 IDs des multiLinks:')
    result.rows.forEach((ml, index) => {
      console.log(`\n${index + 1}. ${ml.title}`)
      console.log(`   ID: ${ml.id}`)
      console.log(`   Parent: ${ml.parentLinkId}`)
    })

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('Erreur:', error.message)
    process.exit(1)
  }
}

checkIds()
