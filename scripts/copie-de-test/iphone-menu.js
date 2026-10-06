// iPhone : on descend la page des liens, puis on ouvre le menu. Le menu doit
// rester colle a l'ecran (haut a 0, hauteur de l'ecran), la page doit defiler.
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await lancer()
  try {
    const { page, erreurs } = await ouvrir(browser, '/dashboard/links', { viewport: { width: 390, height: 664, deviceScaleFactor: 2, isMobile: true, hasTouch: true } })
    await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
    await pause(1500)
    // Defilement au doigt, comme sur le telephone.
    for (let i = 0; i < 6; i++) { await page.mouse.wheel({ deltaY: 400 }); await pause(150) }
    await pause(600)
    const etat = await page.evaluate(() => {
      const zone = [...document.querySelectorAll('div')].find(d => d.className.includes('overflow-y-auto overscroll-contain'))
      return { defilementZone: zone ? Math.round(zone.scrollTop) : null, defilementBody: document.body.scrollTop, defilementFenetre: window.scrollY }
    })
    await photo(page, OUT, 'iphone-apres-defilement')
    await page.evaluate(() => document.querySelector('button[aria-label="Open menu"]')?.click())
    await pause(800)
    const menu = await page.evaluate(() => { const r = document.querySelector('aside').getBoundingClientRect(); return { haut: Math.round(r.top), hauteur: Math.round(r.height), ecran: window.innerHeight } })
    await photo(page, OUT, 'iphone-menu-apres-defilement')
    console.log(JSON.stringify({ ...etat, menu }), '| erreurs :', erreurs.length)
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
