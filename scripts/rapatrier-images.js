/**
 * Rapatrie les images hebergees chez Vercel vers le serveur.
 *
 * Les fichiers televerses par les utilisateurs partaient chez Vercel Blob. Le
 * compte etant impaye, ces fichiers peuvent disparaitre : les pages publiques
 * perdraient alors leur photo. On les ramene donc sur le disque du serveur, et
 * on reecrit les adresses en base pour qu elles pointent vers /media.
 *
 * Prudence deliberee :
 *  - une adresse n est reecrite QUE si le fichier a ete telecharge et verifie
 *  - un fichier deja present n est pas retelecharge, le script est rejouable
 *  - rien n est supprime chez Vercel : en cas de probleme, l ancienne adresse
 *    reste valable
 *
 * Usage : node scripts/rapatrier-images.js <dossier-media> [--dry-run]
 */

const fs = require('fs')
const path = require('path')

const { PrismaClient } = require('@prisma/client')

const [, , mediaDir, ...flags] = process.argv
const dryRun = flags.includes('--dry-run')

if (!mediaDir) {
  console.error('Usage : node scripts/rapatrier-images.js <dossier-media> [--dry-run]')
  process.exit(1)
}

const prisma = new PrismaClient()
const MARQUEUR = 'vercel-storage'

// Chaque entree : la table, la colonne, et de quoi lire puis ecrire.
const CIBLES = [
  { modele: 'link', champ: 'profileImage' },
  { modele: 'link', champ: 'coverImage' },
  { modele: 'multiLink', champ: 'iconImage' },
]

const cheminDepuisUrl = (url) => {
  const apres = new URL(url).pathname.replace(/^\/+/, '')
  // Un composant ".." dans l adresse ferait ecrire hors du dossier prevu.
  if (apres.split('/').some(part => part === '..' || part === '')) return null
  return apres
}

async function telecharger(url, destination) {
  if (fs.existsSync(destination) && fs.statSync(destination).size > 0) return 'deja-present'

  const reponse = await fetch(url)
  if (!reponse.ok) return `echec-${reponse.status}`

  const donnees = Buffer.from(await reponse.arrayBuffer())
  if (donnees.length === 0) return 'fichier-vide'

  fs.mkdirSync(path.dirname(destination), { recursive: true })
  fs.writeFileSync(destination, donnees)
  return 'telecharge'
}

async function main() {
  console.log(dryRun ? 'Mode : simulation\n' : 'Mode : rapatriement reel\n')
  let total = 0, rapatries = 0, echecs = 0

  for (const cible of CIBLES) {
    const lignes = await prisma[cible.modele].findMany({
      where: { [cible.champ]: { contains: MARQUEUR } },
      select: { id: true, [cible.champ]: true },
    })

    for (const ligne of lignes) {
      total++
      const url = ligne[cible.champ]
      const relatif = cheminDepuisUrl(url)
      if (!relatif) { echecs++; console.log(`  ADRESSE REFUSEE  ${url}`); continue }

      const destination = path.join(mediaDir, relatif)
      const etat = dryRun ? 'simule' : await telecharger(url, destination)

      if (etat === 'telecharge' || etat === 'deja-present' || etat === 'simule') {
        if (!dryRun) {
          await prisma[cible.modele].update({
            where: { id: ligne.id },
            data: { [cible.champ]: `/media/${relatif}` },
          })
        }
        rapatries++
        console.log(`  ${etat.padEnd(13)} ${cible.modele}.${cible.champ}  ${relatif.slice(-52)}`)
      } else {
        echecs++
        console.log(`  ${etat.padEnd(13)} ${relatif.slice(-52)}   adresse laissee inchangee`)
      }
    }
  }

  console.log(`\n${rapatries} images rapatriees sur ${total}${echecs ? `, ${echecs} en echec` : ''}.`)
  if (echecs) console.log('Les adresses en echec pointent toujours vers Vercel : rien n est casse.')
}

main()
  .catch(error => { console.error('\nEchec :', error.message); process.exitCode = 1 })
  .finally(() => prisma.$disconnect())
