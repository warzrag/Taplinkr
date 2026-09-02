import fs from 'fs/promises'
import path from 'path'

/**
 * Stockage des fichiers televerses, sur le disque du serveur.
 *
 * Ils partaient auparavant chez Vercel Blob. Le compte etant impaye, ces
 * fichiers pouvaient disparaitre et les pages publiques perdre leur photo. Ils
 * sont desormais ecrits dans un dossier servi directement par Caddy sous
 * /media, sans passer par l application.
 *
 * MEDIA_DIR permet de deplacer ce dossier sans toucher au code.
 */

const RACINE = process.env.MEDIA_DIR || 'C:/web/data/taplinkr-media'
const PREFIXE_PUBLIC = '/media'

/**
 * Ecrit un fichier et renvoie son adresse publique.
 *
 * `cheminRelatif` vient d une valeur construite par l application, jamais
 * directement de l utilisateur, mais on le verifie quand meme : un composant
 * ".." permettrait d ecrire n importe ou sur le disque.
 */
export async function enregistrerMedia(
  cheminRelatif: string,
  contenu: Buffer,
): Promise<{ url: string; chemin: string }> {
  const segments = cheminRelatif.split('/').filter(Boolean)
  if (segments.some(segment => segment === '..' || segment === '.')) {
    throw new Error('Chemin de fichier refuse')
  }

  const destination = path.join(RACINE, ...segments)
  const racineResolue = path.resolve(RACINE)
  if (!path.resolve(destination).startsWith(racineResolue)) {
    throw new Error('Chemin de fichier refuse')
  }

  await fs.mkdir(path.dirname(destination), { recursive: true })
  // wx : echoue si le fichier existe deja, plutot que d ecraser silencieusement
  // le fichier de quelqu un d autre.
  await fs.writeFile(destination, contenu, { flag: 'wx' })

  return { url: `${PREFIXE_PUBLIC}/${segments.join('/')}`, chemin: segments.join('/') }
}

/**
 * Supprime les fichiers dont le chemin commence par ce prefixe.
 *
 * Remplace la suppression par prefixe qu offrait Vercel Blob. L absence de
 * fichier n est pas une erreur : la suppression doit rester rejouable.
 */
export async function supprimerMediasParPrefixe(prefixe: string): Promise<number> {
  const segments = prefixe.split('/').filter(Boolean)
  if (segments.some(segment => segment === '..' || segment === '.')) return 0

  const dossier = path.join(RACINE, ...segments.slice(0, -1))
  const debut = segments[segments.length - 1]
  if (!debut) return 0

  let entrees: string[]
  try {
    entrees = await fs.readdir(dossier)
  } catch {
    return 0
  }

  let supprimes = 0
  for (const entree of entrees) {
    if (!entree.startsWith(debut)) continue
    try {
      await fs.unlink(path.join(dossier, entree))
      supprimes++
    } catch {
      // Fichier deja absent ou verrouille : sans consequence ici.
    }
  }
  return supprimes
}
