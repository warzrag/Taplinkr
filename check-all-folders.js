const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function checkAllFolders() {
  try {
    // Récupérer tous les dossiers
    const folders = await pool.query(`
      SELECT id, name, "createdAt"
      FROM folders
      ORDER BY "createdAt" DESC
    `)

    console.log('\n📁 Tous les dossiers:\n')
    for (const folder of folders.rows) {
      console.log(`\n📂 ${folder.name}`)
      console.log(`   ID: ${folder.id}`)
      
      // Récupérer les liens de ce dossier
      const links = await pool.query(`
        SELECT id, title, slug, clicks, views
        FROM links
        WHERE "folderId" = $1
      `, [folder.id])
      
      const totalClicks = links.rows.reduce((sum, link) => sum + (link.clicks || 0), 0)
      
      console.log(`   Liens: ${links.rows.length}`)
      console.log(`   Clics totaux: ${totalClicks}`)
      
      if (links.rows.length > 0) {
        links.rows.forEach((link, i) => {
          console.log(`      ${i+1}. ${link.title} - ${link.clicks} clics`)
        })
      }
    }

    await pool.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  }
}

checkAllFolders()
