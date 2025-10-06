const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkHugo() {
  try {
    // Chercher le dossier Hugo
    const folders = await pool.query(`
      SELECT id, name, "userId", "createdAt"
      FROM folders
      WHERE name ILIKE '%hugo%'
      ORDER BY "createdAt" DESC
    `)

    console.log('\n📁 Dossiers contenant "Hugo":')
    if (folders.rows.length === 0) {
      console.log('❌ Aucun dossier trouvé')
    } else {
      folders.rows.forEach((f, i) => {
        console.log(`${i+1}. ${f.name}`)
        console.log(`   ID: ${f.id}`)
        console.log(`   Créé: ${f.createdAt}`)
      })
    }

    // Chercher tous les liens
    const links = await pool.query(`
      SELECT id, title, slug, "folderId"
      FROM links
      ORDER BY "createdAt" DESC
    `)

    console.log('\n🔗 Tous les liens:')
    links.rows.forEach((l, i) => {
      console.log(`${i+1}. ${l.title} (${l.slug})`)
      console.log(`   FolderId: ${l.folderId || 'Aucun (non organisé)'}`)
    })

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkHugo()
