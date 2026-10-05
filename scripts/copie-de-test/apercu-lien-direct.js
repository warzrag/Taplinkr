// La fiche "Direct link" : le bloc "Preview on X and other apps" s'affiche-t-il ?
// Copie de test (fausses donnees). Image dans scripts/copie-de-test/images.
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await lancer()
  try {
    const { page, erreurs } = await ouvrir(browser, '/dashboard/links')
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
    await pause(800)
    const cliquer = texte => page.evaluate(t => [...document.querySelectorAll('button')].find(b => b.textContent.trim().startsWith(t))?.click(), texte)
    await cliquer('Create link')
    await pause(700)
    await cliquer('Direct link')
    await page.waitForFunction(() => document.body.innerText.includes('Preview on X'), { timeout: 120000 })
    await pause(800)
    await page.evaluate(() => [...document.querySelectorAll('p')].find(p => p.textContent.trim() === 'Preview on X and other apps')?.scrollIntoView({ block: 'center' }))
    await pause(500)
    await photo(page, OUT, 'apercu-lien-direct')
    console.log('erreurs :', erreurs.length ? erreurs.join(' | ') : 'aucune')
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
