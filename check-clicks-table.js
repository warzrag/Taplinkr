const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
pool.query('SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = $1 ORDER BY ordinal_position', ['clicks'])
  .then(r => {
    console.log('\n📋 Structure de la table clicks:\n')
    r.rows.forEach(col => {
      console.log('- ' + col.column_name + ' (' + col.data_type + ') ' + (col.is_nullable === 'NO' ? '⚠️ NOT NULL' : ''))
    })
    pool.end()
  })
  .catch(e => { console.error(e); pool.end() })
