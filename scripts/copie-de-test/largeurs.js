// Page des liens a plusieurs largeurs d'ecran : la zone de contenu deborde-t-elle
// en largeur (barre de defilement horizontale) ?
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })
const LARGEURS = (process.env.LARGEURS || '390,768,1024,1100,1180,1280,1366,1440').split(',').map(Number)

;(async () => {
  const browser = await lancer()
  try {
    for (const largeur of LARGEURS) {
      const mobile = largeur < 640
      const { page } = await ouvrir(browser, (process.env.PAGE || '/dashboard/links'), { viewport: { width: largeur, height: 860, isMobile: mobile, hasTouch: mobile } })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
      await pause(1500)
      const m = await page.evaluate(() => {
        const zone = [...document.querySelectorAll('div')].find(d => d.className.includes('overflow-y-auto overscroll-contain'))
        const tableaux = [...document.querySelectorAll('.overflow-x-auto')].map(t => t.scrollWidth - t.clientWidth)
        const lignes = [...document.querySelectorAll('article')]
        return {
          zoneDeborde: zone ? zone.scrollWidth - zone.clientWidth : null,
          lignesTropLarges: lignes.filter(a => a.scrollWidth > a.clientWidth + 1).length,
          lignes: lignes.length,
          tableauDeborde: tableaux,
        }
      })
      console.log(String(largeur).padStart(5), JSON.stringify(m))
      await photo(page, OUT, `largeur${(process.env.PAGE || '/dashboard/links').replace(/\//g, '-')}-${largeur}`)
      await page.close()
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
