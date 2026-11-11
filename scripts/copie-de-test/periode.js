// Stats : boutons de periode (Hier, Personnalise) et choix du fuseau horaire.
// Verifie ce que la page demande au serveur, et photographie l'ecran.
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })

async function cliquerTexte(page, selecteur, texte) {
  const ok = await page.evaluate((sel, txt) => {
    const el = [...document.querySelectorAll(sel)].find(e => e.textContent.trim() === txt)
    if (el) el.click()
    return Boolean(el)
  }, selecteur, texte)
  if (!ok) throw new Error(`introuvable : ${texte}`)
}

async function poserDate(page, index, valeur) {
  await page.evaluate((i, v) => {
    const champ = document.querySelectorAll('input[type="date"]')[i]
    const poser = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set
    poser.call(champ, v)
    champ.dispatchEvent(new Event('input', { bubbles: true }))
  }, index, valeur)
}

;(async () => {
  const browser = await lancer()
  try {
    for (const largeur of [1440, 390]) {
      const mobile = largeur < 640
      const { page } = await ouvrir(browser, '/dashboard/analytics', { viewport: { width: largeur, height: 900, isMobile: mobile, hasTouch: mobile } })
      const demandes = []
      page.on('request', r => { if (r.url().includes('/api/analytics/charts')) demandes.push(decodeURIComponent(r.url().split('?')[1] || '')) })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
      await pause(1200)
      const mesure = () => page.evaluate(() => {
        const zone = [...document.querySelectorAll('div')].find(d => d.className.includes('overflow-y-auto overscroll-contain'))
        const texte = [...document.querySelectorAll('p')].find(p => p.textContent.startsWith('Clicks, visitors'))
        return { deborde: zone ? zone.scrollWidth - zone.clientWidth : null, phrase: texte?.textContent }
      })
      console.log(largeur, 'depart', JSON.stringify(await mesure()))
      await photo(page, OUT, `periode-depart-${largeur}`)

      await cliquerTexte(page, 'button', 'Yesterday')
      await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => {})
      console.log(largeur, 'hier', demandes.at(-1), JSON.stringify(await mesure()))

      await cliquerTexte(page, 'button', 'Custom')
      await pause(500)
      await poserDate(page, 0, '2026-10-01')
      await poserDate(page, 1, '2026-10-20')
      await pause(300)
      await photo(page, OUT, `periode-calendrier-${largeur}`)
      await cliquerTexte(page, 'button', 'Apply')
      await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => {})
      console.log(largeur, 'perso', demandes.at(-1), JSON.stringify(await mesure()))

      await page.select('select', 'Asia/Karachi')
      await page.waitForNetworkIdle({ idleTime: 500 }).catch(() => {})
      await pause(800)
      console.log(largeur, 'fuseau', JSON.stringify(await mesure()), await page.$eval('select', s => s.value))
      await photo(page, OUT, `periode-fuseau-${largeur}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
