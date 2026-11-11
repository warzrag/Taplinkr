// Onglet "Countries" des stats, sur ordinateur et sur iPhone, puis filtre
// sur un seul lien. Photos dans images/.
const fs = require('fs')
const { lancer, ouvrir, photo, pause } = require('./harnais')
const OUT = __dirname + '/images'
fs.mkdirSync(OUT, { recursive: true })

;(async () => {
  const browser = await lancer()
  try {
    for (const largeur of [1440, 390]) {
      const mobile = largeur < 640
      const { page } = await ouvrir(browser, '/dashboard/analytics', { viewport: { width: largeur, height: 900, isMobile: mobile, hasTouch: mobile } })
      await page.waitForNetworkIdle({ idleTime: 800, timeout: 180000 }).catch(() => {})
      const onglet = await page.waitForFunction(() => [...document.querySelectorAll('nav button')].find(b => b.textContent.includes('Countries')), { timeout: 60000 })
      await onglet.click()
      await pause(1500)
      const lignes = await page.evaluate(() => {
        const liste = document.querySelector('ol')
        const zone = [...document.querySelectorAll('div')].find(d => d.className.includes('overflow-y-auto overscroll-contain'))
        return {
          pays: liste ? [...liste.querySelectorAll('li')].map(li => li.innerText.replace(/\s+/g, ' ').trim()) : [],
          drapeaux: [...document.querySelectorAll('ol img')].map(i => i.complete && i.naturalWidth > 0).filter(Boolean).length,
          deborde: zone ? zone.scrollWidth - zone.clientWidth : null,
        }
      })
      console.log(largeur, JSON.stringify(lignes, null, 1))
      await page.evaluate(() => document.querySelector('ol')?.scrollIntoView({ block: 'center' }))
      await pause(800)
      await photo(page, OUT, `pays-${largeur}`)
      if (!mobile) {
        await page.select('select', (await page.$$eval('select option', o => o[1]?.value)))
        await pause(1000)
        console.log('un lien :', await page.$$eval('ol li', l => l.map(x => x.innerText.replace(/\s+/g, ' ').trim())))
        await photo(page, OUT, `pays-un-lien-${largeur}`)
      }
      await page.close()
    }
  } finally {
    await browser.close()
  }
})().catch(e => { console.error('ECHEC', e.message); process.exit(1) })
