/**
 * Essaie de creer un lien dans la vraie base, puis ANNULE tout.
 *
 * La creation se fait dans une transaction que le script fait echouer lui-meme
 * a la fin : PostgreSQL controle tout le contenu (champs, types, cles), mais
 * rien n'est enregistre. Pour prouver qu'un contenu est accepte avant de mettre
 * une correction en ligne.
 *
 *   node --env-file=.env scripts/essai-creation-lien.js
 *
 * A lancer depuis le dossier du site sur le serveur.
 */

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const ANNULATION = 'ANNULATION_VOLONTAIRE'

// Le lien d'un client, pris sur sa capture : un direct link vers Telegram.
function contenu(userId, slug) {
  return {
    userId, teamShared: false, teamId: null, originalOwnerId: null, assignedToUserId: null,
    title: 'Direct link', internalName: 'bot feed', slug, description: '',
    directUrl: 'https://t.me/nikky_xxo', isDirect: true, isActive: true, shieldEnabled: false,
    isUltraLink: false, shieldConfig: null, clicks: 0, views: 0, order: 1, color: '#8b5cf6', icon: '',
    profileImage: null, profileStyle: 'circle', coverImage: null, fontFamily: 'system',
    borderRadius: 'rounded-2xl', backgroundColor: '#070a12', textColor: '#f8fafc',
    instagramUrl: null, tiktokUrl: null, twitterUrl: null, youtubeUrl: null,
    animation: 'none', isOnline: false, city: null, country: null,
  }
}

async function essai(nom, data) {
  try {
    await prisma.$transaction(async (tx) => {
      await tx.link.create({ data })
      throw new Error(ANNULATION)
    })
    console.log(nom, '-> ??? la transaction aurait du etre annulee')
  } catch (e) {
    const m = String(e && e.message)
    if (m.includes(ANNULATION)) console.log(nom.padEnd(20), '-> ACCEPTE par la base (puis annule, rien d enregistre)')
    else if (/Unknown argument `(\w+)`/.test(m)) console.log(nom.padEnd(20), '-> REFUSE :', m.match(/Unknown argument `\w+`/)[0])
    else console.log(nom.padEnd(20), '-> autre erreur :', m.slice(-300))
  }
}

;(async () => {
  // Un compte reel est necessaire : le lien doit appartenir a quelqu'un.
  const compte = await prisma.user.findFirst({ where: { email: 'florentivo95270@gmail.com' }, select: { id: true } })
  if (!compte) { console.log('Compte de reference introuvable'); return }
  const slug = 'essai-annule-' + Date.now()

  await essai('avant (avec bio)', { ...contenu(compte.id, slug), bio: '' })
  await essai('apres (sans bio)', contenu(compte.id, slug))

  // Controle final : l'adresse d'essai ne doit exister nulle part.
  const reste = await prisma.link.count({ where: { slug } })
  console.log('liens d essai restes en base :', reste)
})()
  .catch(e => console.error('Echec :', e.message))
  .finally(() => prisma.$disconnect())
