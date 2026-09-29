// Animations reduites : les pages s'affichent-elles sans erreur ?
// Usage : node calme.js [base]  (base par defaut : serveur local)
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'

;(async () => {
  const browser = await lancer()
  try {
    for (const chemin of ['/dashboard', '/dashboard/links', '/dashboard/analytics']) {
      const { page, erreurs } = await ouvrir(browser, chemin, { calme: true })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 120000 }).catch(() => {})
      await pause(1500)
      await photo(page, OUT, `calme${chemin.replace(/\//g, '-')}`)
      console.log(chemin, erreurs.length ? erreurs.join(' | ') : 'aucune erreur')
      await page.close()
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
