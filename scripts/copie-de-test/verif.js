// Series d'images des animations de l'espace membre, sur la copie de test.
// A : chargement puis tableau de bord ; B : menu qui glisse ; C : page des
// liens (copie, fenetre, nouveau lien, suppression) ; D : Analytics.
const fs = require('fs')
const { lancer, ouvrir, photo, serie, pause, BASE } = require('./harnais')

const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })
for (const f of fs.readdirSync(OUT)) fs.unlinkSync(`${OUT}/${f}`)

async function elementTexte(page, texte) {
  const handle = await page.evaluateHandle(t => [...document.querySelectorAll('button, a')].find(el => el.textContent.trim() === t), texte)
  const el = handle.asElement()
  if (!el) throw new Error('introuvable : ' + texte)
  return el
}

;(async () => {
  const browser = await lancer()
  const toutes = []
  try {
    await browser.defaultBrowserContext().overridePermissions(BASE, ['clipboard-read', 'clipboard-write', 'clipboard-sanitized-write'])

    // Chauffe : en developpement, chaque page se compile a sa premiere visite.
    for (const chemin of ['/dashboard', '/dashboard/links', '/dashboard/analytics']) {
      const { page } = await ouvrir(browser, chemin)
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
      await page.close()
      console.log('chauffe', chemin)
    }

    // A. Chargement (session retardee) puis tableau de bord.
    {
      const { page, erreurs } = await ouvrir(browser, '/dashboard', { retardSession: 1200 })
      await serie(page, OUT, 'A-arrivee', [300, 900, 1500, 1800, 2200, 2700, 3400])
      toutes.push(...erreurs)

      // B. Le menu : on clique "Links".
      await pause(800)
      const lien = await elementTexte(page, 'Links')
      await lien.click()
      await serie(page, OUT, 'B-menu', [40, 140, 280, 500, 900, 1600])
      await page.close()
    }

    // C. Page des liens.
    {
      const { page, donnees, erreurs } = await ouvrir(browser, '/dashboard/links')
      await serie(page, OUT, 'C0-chargement', [500, 800, 1100, 1400, 1800, 2400])
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 60000 }).catch(() => {})
      await pause(600)

      // Copie : la coche remplace l'icone.
      const adresse = await elementTexte(page, 'taplinkr.com/mia')
      await adresse.click()
      await serie(page, OUT, 'C1-copie', [60, 250, 600, 2300])

      // Fenetre de creation : elle sort du bouton.
      const creer = await elementTexte(page, 'Create link')
      await creer.click()
      await serie(page, OUT, 'C2-fenetre', [20, 90, 170, 280, 450])
      // Fermeture par le bouton Cancel de la fenetre (clic direct dans la page).
      await page.evaluate(() => [...document.querySelectorAll('button')].filter(b => b.textContent.trim() === 'Cancel').pop()?.click())
      await pause(700)

      // Nouveau lien : un lien "cree ailleurs" arrive au rafraichissement suivant.
      donnees.ajouterAuProchainBasculement = true
      await photo(page, OUT, 'C2b-apres-fermeture')
      const infos = await page.evaluate(() => [...document.querySelectorAll('button[aria-label="Disable link"]')].map(b => { const r = b.getBoundingClientRect(); return `${Math.round(r.x)},${Math.round(r.y)} ${Math.round(r.width)}x${Math.round(r.height)}` }))
      console.log('interrupteurs :', infos.join(' | '))
      await page.evaluate(() => document.querySelector('button[aria-label="Disable link"]')?.click())
      await serie(page, OUT, 'C3-nouveau', [300, 700, 1200, 2000, 3200, 4600])

      // Suppression : le lien s'efface, les suivants remontent.
      await page.evaluate(() => document.querySelector('button[aria-label="Delete TikTok"]')?.click())
      await serie(page, OUT, 'C4-suppression', [60, 200, 380, 650, 1100])
      toutes.push(...erreurs)
      await page.close()
    }

    // E. La ligne d'un lien tient-elle, interrupteur visible, en 1280 et 1440 ?
    for (const largeur of [1280, 1440]) {
      const { page } = await ouvrir(browser, '/dashboard/links', { viewport: { width: largeur, height: 850 } })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 60000 }).catch(() => {})
      await pause(1500)
      const mesure = await page.evaluate(() => {
        const bascules = [...document.querySelectorAll('button[aria-label="Disable link"], button[aria-label="Enable link"]')]
        const lignes = [...document.querySelectorAll('article')]
        const deborde = lignes.filter(a => a.scrollWidth > a.clientWidth + 1).length
        return { interrupteurs: bascules.map(b => Math.round(b.getBoundingClientRect().width)).join(','), lignes: lignes.length, debordent: deborde }
      })
      console.log(`largeur ${largeur} :`, JSON.stringify(mesure))
      await photo(page, OUT, `E-ligne-${largeur}`)
      await page.close()
    }

    // D. Analytics.
    {
      const { page, erreurs } = await ouvrir(browser, '/dashboard/analytics')
      await serie(page, OUT, 'D-analytics', [900, 1500, 2200, 3200])
      toutes.push(...erreurs)
      await page.close()
    }
    console.log('erreurs :', toutes.length ? [...new Set(toutes)].join(' | ') : 'aucune')
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
