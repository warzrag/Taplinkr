/**
 * Reimportation de la sauvegarde Firestore dans PostgreSQL.
 *
 * Le point delicat : Firestore accepte n importe quelle forme de document,
 * PostgreSQL non. Trois ecarts doivent etre traites, sinon l import echoue au
 * premier document bancal et laisse la base a moitie remplie.
 *
 *  1. Champs inconnus du schema -> ignores. Firestore a pu accumuler des champs
 *     qui n existent dans aucun modele.
 *  2. Champs obligatoires absents -> le document est mis de cote et compte, pas
 *     inserer de force avec une valeur inventee.
 *  3. Cles etrangeres orphelines -> un clic qui designe un lien supprime ne peut
 *     pas entrer. Ces documents sont ecartes et denombres.
 *
 * L ordre d insertion suit les dependances : un enfant ne peut pas precede son
 * parent.
 *
 * Le script se relit : il utilise skipDuplicates, donc le relancer apres une
 * interruption reprend sans creer de doublon.
 *
 * Usage :
 *   node scripts/firestore-import.js <dossier-sauvegarde> [--dry-run]
 */

const fs = require('fs')
const path = require('path')
const readline = require('readline')

const { Prisma, PrismaClient } = require('@prisma/client')

const [, , backupDir, ...flags] = process.argv
const dryRun = flags.includes('--dry-run')

if (!backupDir) {
  console.error('Usage : node scripts/firestore-import.js <dossier-sauvegarde> [--dry-run]')
  process.exit(1)
}

const prisma = new PrismaClient()

/**
 * Certaines relations sont circulaires : un utilisateur designe son equipe, et
 * l equipe designe son proprietaire. Aucun ordre d insertion ne satisfait les
 * deux. Ces liens sont donc laisses vides a l insertion, puis retablis une fois
 * les deux tables remplies.
 */
const differes = []

// Meme correspondance que lib/firestore-adapter.ts : c est elle qui a servi a
// ecrire les donnees, elle doit servir a les relire.
const COLLECTION = {
  user: 'users', link: 'links', multiLink: 'multiLinks', click: 'clicks',
  filteredClick: 'filteredClicks', folder: 'folders', file: 'files',
  analyticsEvent: 'analyticsEvents', analyticsSummary: 'analyticsSummary',
  template: 'templates', userProfile: 'userProfiles', userTheme: 'userThemes',
  passwordProtection: 'passwordProtections', passwordAttempt: 'passwordAttempts',
  linkSchedule: 'linkSchedules', scheduledJob: 'scheduledJobs',
  customDomain: 'customDomains', notification: 'notifications',
  notificationPreference: 'notificationPreferences', pushSubscription: 'pushSubscriptions',
  team: 'teams', teamInvitation: 'teamInvitations', teamTemplate: 'teamTemplates',
  teamAnalytics: 'teamAnalytics', verificationToken: 'verificationTokens',
  promoCode: 'promoCodes', promoRedemption: 'promoRedemptions',
  teamLinkHistory: 'teamLinkHistory', teamAuditLog: 'teamAuditLogs',
}

// Ordre de dependance : les parents d abord. Etabli a partir des relations du
// schema, pas devine.
const ORDER = [
  'user', 'team', 'userProfile', 'userTheme', 'notificationPreference',
  'pushSubscription', 'promoCode', 'promoRedemption', 'verificationToken',
  'folder', 'link', 'multiLink', 'customDomain', 'passwordProtection',
  'linkSchedule', 'scheduledJob', 'template', 'teamTemplate', 'teamInvitation',
  'teamAnalytics', 'teamLinkHistory', 'teamAuditLog', 'file', 'notification',
  'passwordAttempt', 'analyticsSummary', 'analyticsEvent', 'click', 'filteredClick',
]

const models = new Map(Prisma.dmmf.datamodel.models.map(m => [m.name[0].toLowerCase() + m.name.slice(1), m]))

// Restitue les types encodes par la sauvegarde. Sans cela un horodatage
// reviendrait sous forme d objet et PostgreSQL le refuserait.
function decode(value) {
  if (value === null || value === undefined) return null
  if (Array.isArray(value)) return value.map(decode)
  if (typeof value === 'object') {
    if (value.__type === 'timestamp') return new Date(value.value)
    if (value.__type === 'bytes') return Buffer.from(value.value, 'base64')
    if (value.__type === 'geopoint') return { latitude: value.latitude, longitude: value.longitude }
    if (value.__type === 'reference') return value.path
    const out = {}
    for (const [key, item] of Object.entries(value)) out[key] = decode(item)
    return out
  }
  return value
}

function coerce(field, value) {
  if (value === null) return null
  switch (field.type) {
    case 'DateTime': return value instanceof Date ? value : new Date(value)
    case 'Int': { const n = Number(value); return Number.isFinite(n) ? Math.trunc(n) : null }
    case 'Float': { const n = Number(value); return Number.isFinite(n) ? n : null }
    case 'Boolean': return Boolean(value)
    case 'String': return typeof value === 'string' ? value : String(value)
    case 'Json': return value
    default: return value
  }
}

async function importModel(modelName, seenIds) {
  const model = models.get(modelName)
  const file = path.join(backupDir, `${COLLECTION[modelName]}.ndjson`)
  const stats = { lus: 0, inseres: 0, champsIncomplets: 0, orphelins: 0 }
  if (!model || !fs.existsSync(file)) return stats

  const scalars = model.fields.filter(f => f.kind === 'scalar' || f.kind === 'enum')
  const required = scalars.filter(f => f.isRequired && !f.hasDefaultValue && !f.isUpdatedAt)
  // Relations obligatoires : leur cle etrangere doit designer une ligne existante.
  const foreignKeys = model.fields
    .filter(f => f.kind === 'object' && f.relationFromFields?.length === 1)
    .map(f => ({ field: f.relationFromFields[0], target: f.type[0].toLowerCase() + f.type.slice(1), optional: !f.isRequired }))

  const ids = new Set()
  let batch = []

  const flush = async () => {
    if (!batch.length || dryRun) { batch = []; return }
    const created = await prisma[modelName].createMany({ data: batch, skipDuplicates: true })
    stats.inseres += created.count
    batch = []
  }

  const rl = readline.createInterface({ input: fs.createReadStream(file), crlfDelay: Infinity })
  for await (const line of rl) {
    if (!line.trim()) continue
    stats.lus++
    const { id, data } = JSON.parse(line)
    const decoded = decode(data)

    const row = { id }
    for (const field of scalars) {
      if (field.name === 'id') continue
      if (decoded[field.name] === undefined) continue
      const value = coerce(field, decoded[field.name])
      // Transmettre null a un champ non nullable est refuse, meme s il possede
      // une valeur par defaut : il faut omettre le champ pour que le defaut
      // s applique. Firestore, lui, accepte les null partout.
      if (value === null && field.isRequired) continue
      row[field.name] = value
    }

    if (required.some(f => row[f.name] === undefined || row[f.name] === null)) {
      stats.champsIncomplets++
      continue
    }

    let orphan = false
    for (const fk of foreignKeys) {
      const value = row[fk.field]
      if (value === undefined || value === null) {
        if (!fk.optional) orphan = true
        continue
      }
      const connus = seenIds.get(fk.target)
      if (!connus) {
        // Le parent appartient a une table pas encore remplie : on differe le
        // lien plutot que d ecarter la ligne.
        if (fk.optional) {
          differes.push({ modele: modelName, id, champ: fk.field, cible: fk.target, valeur: value })
          row[fk.field] = null
        } else orphan = true
        continue
      }
      if (!connus.has(value)) {
        // Parent reellement absent : cle videe si la relation est facultative,
        // ligne ecartee sinon.
        if (fk.optional) row[fk.field] = null
        else orphan = true
      }
    }
    if (orphan) { stats.orphelins++; continue }

    ids.add(id)
    batch.push(row)
    if (batch.length >= 1000) await flush()
  }
  await flush()

  seenIds.set(modelName, ids)
  return stats
}

async function main() {
  const manifest = JSON.parse(fs.readFileSync(path.join(backupDir, '_manifeste.json'), 'utf8'))
  console.log(`Sauvegarde : ${manifest.total} documents, faite le ${manifest.faitLe}`)
  console.log(dryRun ? 'Mode       : simulation, aucune ecriture\n' : 'Mode       : import reel\n')

  const seenIds = new Map()
  const totals = { lus: 0, inseres: 0, champsIncomplets: 0, orphelins: 0 }

  for (const modelName of ORDER) {
    const stats = await importModel(modelName, seenIds)
    if (stats.lus === 0) continue
    for (const key of Object.keys(totals)) totals[key] += stats[key]
    const notes = [
      stats.champsIncomplets ? `${stats.champsIncomplets} incomplets` : null,
      stats.orphelins ? `${stats.orphelins} orphelins` : null,
    ].filter(Boolean).join(', ')
    console.log(`  ${String(stats.inseres).padStart(7)} / ${String(stats.lus).padEnd(7)} ${modelName}${notes ? '   (' + notes + ')' : ''}`)
  }

  // Les liens circulaires sont retablis maintenant que toutes les tables sont
  // remplies. Un lien dont la cible n existe finalement pas reste vide.
  let retablis = 0
  let abandonnes = 0
  for (const lien of differes) {
    if (!seenIds.get(lien.cible)?.has(lien.valeur)) { abandonnes++; continue }
    if (dryRun) { retablis++; continue }
    await prisma[lien.modele].update({
      where: { id: lien.id },
      data: { [lien.champ]: lien.valeur },
    })
    retablis++
  }

  console.log(`\n${totals.inseres} lignes inserees sur ${totals.lus} lues.`)
  if (differes.length) {
    console.log(`${retablis} liens circulaires retablis${abandonnes ? `, ${abandonnes} cibles introuvables` : ''}.`)
  }
  if (totals.champsIncomplets) console.log(`${totals.champsIncomplets} documents sans champ obligatoire.`)
  if (totals.orphelins) console.log(`${totals.orphelins} documents designant un parent absent.`)
}

main()
  .catch(error => { console.error('\nEchec :', error.message); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
