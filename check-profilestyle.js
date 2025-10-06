const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkProfileStyle() {
  try {
    // Vérifier si la colonne profileStyle existe
    const result = await pool.query(`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_name = 'links' 
      AND column_name = 'profileStyle'
    `)

    if (result.rows.length === 0) {
      console.log('❌ La colonne profileStyle n\'existe PAS dans la table links')
    } else {
      console.log('✅ La colonne profileStyle existe :')
      console.log(result.rows[0])
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkProfileStyle()
