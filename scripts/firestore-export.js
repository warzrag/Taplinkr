/**
 * Sauvegarde complete de la base Firestore sur disque.
 *
 * Ecrit un fichier NDJSON par collection : une ligne = un document. Ce format
 * se lit ligne par ligne, donc une collection de plusieurs centaines de milliers
 * de documents ne sature jamais la memoire, ni a l ecriture ni a la relecture.
 *
 * Les types propres a Firestore sont conserves sous une forme explicite
 * (horodatages, references, coordonnees) pour que la reimportation restitue
 * exactement les memes valeurs, et non des chaines de caracteres.
 *
 * Lecture seule : ce script ne modifie jamais la base.
 *
 * Usage :
 *   node scripts/firestore-export.js <chemin-cle.json> <dossier-sortie> [--since=ISO]
 *
 * --since ne sauvegarde que les documents crees apres une date. Sert a la
 * resynchronisation finale, juste avant la bascule, pour rattraper les clics
 * arrives depuis la sauvegarde complete.
 */

const fs = require('fs')
const path = require('path')

const [, , keyPath, outDir, ...rest] = process.argv

if (!keyPath || !outDir) {
  console.error('Usage : node scripts/firestore-export.js <cle.json> <dossier> [--since=ISO]')
  process.exit(1)
}

const sinceArg = rest.find(a => a.startsWith('--since='))
const since = sinceArg ? new Date(sinceArg.slice('--since='.length)) : null
if (since && Number.isNaN(since.getTime())) {
  console.error('--since : date invalide')
  process.exit(1)
}

const admin = require('firebase-admin')
const serviceAccount = require(path.resolve(keyPath))

admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
const db = admin.firestore()

// Firestore renvoie ses propres classes : sans conversion explicite, JSON.stringify
// les aplatirait en objets sans type et la reimportation serait fausse.
function encode(value) {
  if (value === null || value === undefined) return null
  if (value instanceof admin.firestore.Timestamp) {
    return { __type: 'timestamp', value: value.toDate().toISOString() }
  }
  if (value instanceof admin.firestore.GeoPoint) {
    return { __type: 'geopoint', latitude: value.latitude, longitude: value.longitude }
  }
  if (value instanceof admin.firestore.DocumentReference) {
    return { __type: 'reference', path: value.path }
  }
  if (Buffer.isBuffer(value)) {
    return { __type: 'bytes', value: value.toString('base64') }
  }
  if (Array.isArray(value)) return value.map(encode)
  if (typeof value === 'object') {
    const out = {}
    for (const [key, item] of Object.entries(value)) out[key] = encode(item)
    return out
  }
  return value
}

const PAGE = 500

async function exportCollection(collection) {
  const name = collection.id
  const file = path.join(outDir, `${name}.ndjson`)
  const stream = fs.createWriteStream(file, { encoding: 'utf8' })

  let written = 0
  let skipped = 0
  let cursor = null

  for (;;) {
    // Tri par identifiant : c est le seul ordre garanti sur toutes les
    // collections, et il ne demande aucun index.
    let query = collection.orderBy('__name__').limit(PAGE)
    if (cursor) query = query.startAfter(cursor)

    const snap = await query.get()
    if (snap.empty) break

    for (const doc of snap.docs) {
      const data = doc.data()

      if (since) {
        const createdAt = data.createdAt
        const at = createdAt instanceof admin.firestore.Timestamp
          ? createdAt.toDate()
          : createdAt ? new Date(createdAt) : null
        if (!at || at < since) { skipped++; continue }
      }

      stream.write(JSON.stringify({ id: doc.id, data: encode(data) }) + '\n')
      written++
    }

    cursor = snap.docs[snap.docs.length - 1]
    if (snap.size < PAGE) break
    if (written % 5000 === 0 && written > 0) {
      process.stdout.write(`   ${name} : ${written} documents...\n`)
    }
  }

  await new Promise(resolve => stream.end(resolve))
  if (written === 0) fs.unlinkSync(file)
  return { name, written, skipped }
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true })

  const collections = await db.listCollections()
  console.log(`Projet   : ${serviceAccount.project_id}`)
  console.log(`Sortie   : ${outDir}`)
  console.log(`Mode     : ${since ? 'incremental depuis ' + since.toISOString() : 'complet'}`)
  console.log(`Collections : ${collections.length}\n`)

  const results = []
  for (const collection of collections) {
    const result = await exportCollection(collection)
    results.push(result)
    console.log(`  ${result.written.toString().padStart(7)}  ${result.name}${result.skipped ? `  (${result.skipped} ignores)` : ''}`)
  }

  const total = results.reduce((sum, r) => sum + r.written, 0)
  const manifest = {
    projet: serviceAccount.project_id,
    faitLe: new Date().toISOString(),
    mode: since ? 'incremental' : 'complet',
    depuis: since ? since.toISOString() : null,
    total,
    collections: results,
  }
  fs.writeFileSync(path.join(outDir, '_manifeste.json'), JSON.stringify(manifest, null, 2))

  console.log(`\n${total} documents sauvegardes.`)
  console.log(`Manifeste : ${path.join(outDir, '_manifeste.json')}`)
}

main().catch(error => {
  console.error('\nEchec de la sauvegarde :', error.message)
  process.exit(1)
})
