// L'espace membre au format iPhone (390 x 844) : photos de chaque page, menu
// ouvert compris, et mesure de ce qui deborde de l'ecran.
// BASE=https://www.taplinkr.com node scripts/copie-de-test/iphone.js
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })
const IPHONE = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true }

;(async () => {
  const browser = await lancer()
  try {
    for (const chemin of ['/dashboard', '/dashboard/links', '/dashboard/analytics']) {
      const { page, erreurs } = await ouvrir(browser, chemin, { viewport: IPHONE })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 120000 }).catch(() => {})
      await pause(1800)
      const nom = chemin.replace(/\//g, '-').slice(1)
      await photo(page, OUT, `iphone-${nom}`)
      // Ce qui depasse a droite de l'ecran.
      const debords = await page.evaluate(() => {
        const largeur = document.documentElement.clientWidth
        return [...document.querySelectorAll('body *')]
          .filter(el => { const r = el.getBoundingClientRect(); return r.width > 0 && r.right > largeur + 2 && getComputedStyle(el).position !== 'fixed' })
          .slice(0, 8)
          .map(el => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)} -> ${Math.round(el.getBoundingClientRect().right)}px`)
      })
      console.log(chemin, '| erreurs :', erreurs.length, '| debordent :', debords.length ? '\n  ' + debords.join('\n  ') : 'rien')
      // Page entiere (le contenu defile dans le body).
      await page.evaluate(() => { document.documentElement.style.height = 'auto'; document.body.style.height = 'auto' })
      await pause(400)
      await page.screenshot({ path: `${OUT}/iphone-${nom}-entier.png`, fullPage: true })
      await page.close()
    }
    // Menu ouvert sur la page des liens.
    const { page } = await ouvrir(browser, '/dashboard/links', { viewport: IPHONE })
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 120000 }).catch(() => {})
    await pause(1200)
    await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.click())
    await pause(800)
    await photo(page, OUT, 'iphone-menu-ouvert')
    await page.close()
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
