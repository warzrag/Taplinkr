// Copie de test de l'espace membre : Chrome ouvre le serveur de developpement
// local, et ce module repond lui-meme a toutes les requetes /api avec de
// fausses donnees (aucune base, aucun vrai compte, rien ne part en ligne).
// Formes des reponses : releve du 29 sept. 2026 (LinksContext, metrics,
// sidebar-usage, click-counts, analytics/charts...). Si une page ajoute un
// appel /api, il repond {} ici : ajouter sa fausse reponse.
//
//   1. lancer le serveur de developpement sur le port 3005
//   2. node scripts/copie-de-test/verif.js      (images dans scripts/copie-de-test/images)
//      node scripts/copie-de-test/calme.js      (animations reduites)
//      python scripts/copie-de-test/planches.py (images assemblees en planches)
//   BASE=https://www.taplinkr.com devant la commande : meme chose sur le vrai site.
//
// Les photos se prennent sur l'ecran entier : une photo decoupee (clip) rate
// les calques animes. puppeteer-core vient du projet Spectra, sur ce PC.
const puppeteer = require('C:/Users/flore/Documents/Codex/Spectra/desktop-app/node_modules/puppeteer-core')

// BASE=https://www.taplinkr.com pour verifier le vrai site : les requetes /api
// restent interceptees ici, rien n'atteint le serveur ni un vrai compte.
const BASE = process.env.BASE || 'http://localhost:3005'
const pause = ms => new Promise(r => setTimeout(r, ms))

function isoDay(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function creerDonnees() {
  const now = new Date().toISOString()
  const links = [
    { id: 'lnk_1', title: 'Instagram bio', internalName: 'IG bio', slug: 'mia', isActive: true, isDirect: false, directUrl: null, multiLinks: [{}, {}, {}, {}], clicks: 1240, folderId: 'fld_1', canDelete: true, order: 1, createdAt: now, updatedAt: now },
    { id: 'lnk_2', title: 'TikTok drop', internalName: 'TikTok', slug: 'mia-tiktok', isActive: true, isDirect: true, directUrl: 'https://shop.example.com/drop', multiLinks: [], clicks: 530, folderId: 'fld_1', canDelete: true, order: 2, createdAt: now, updatedAt: now },
    { id: 'lnk_3', title: 'Newsletter', internalName: null, slug: 'mia-news', isActive: false, isDirect: true, directUrl: 'https://news.example.com/join', multiLinks: [], clicks: 212, folderId: 'fld_2', canDelete: true, order: 3, createdAt: now, updatedAt: now },
    { id: 'lnk_4', title: 'Chat', internalName: 'Chat link', slug: 'mia-chat', isActive: true, isDirect: true, directUrl: 'https://chat.example.com/mia', multiLinks: [], clicks: 890, folderId: 'fld_2', canDelete: true, order: 4, createdAt: now, updatedAt: now },
    { id: 'lnk_5', title: 'Shop', internalName: 'Shop page', slug: 'mia-shop', isActive: true, isDirect: false, directUrl: null, multiLinks: [{}, {}], clicks: 340, folderId: null, canDelete: true, order: 5, createdAt: now, updatedAt: now },
  ]
  const folders = [
    { id: 'fld_1', name: 'Instagram', description: 'Bio links', color: '#8b5cf6', icon: '', order: 1, parentId: null, links: [], children: [] },
    { id: 'fld_2', name: 'Campaign A', description: 'Autumn drop', color: '#22d3ee', icon: '', order: 2, parentId: null, links: [], children: [] },
  ]
  return { links, folders, ajouterAuProchainBasculement: false }
}

function metrics(period, links) {
  const curve = [3, 2, 1, 1, 0, 1, 4, 8, 12, 15, 14, 18, 22, 19, 17, 21, 26, 30, 28, 24, 18, 12, 8, 5]
  const hourlyClicks = curve.map((clicks, hour) => ({ hour, clicks }))
  const days = period === '30d' ? 30 : period === '7d' ? 7 : 1
  const dailyClicks = Array.from({ length: days }, (_, i) => {
    const total = days === 1 ? 182 : 60 + Math.round(40 * Math.sin(i / 2) + i * 4)
    return { date: isoDay(i - days + 1), clicks: { lnk_1: Math.round(total * 0.6), lnk_2: Math.round(total * 0.25), lnk_4: Math.round(total * 0.15) }, total }
  })
  const recent = ['France', 'Belgium', 'Canada', 'France', 'Switzerland', 'France']
  return {
    realClicks: days === 1 ? 182 : dailyClicks.reduce((sum, d) => sum + d.total, 0),
    uniqueVisitors: days === 1 ? 140 : 900,
    pageViews: days === 1 ? 260 : 1700,
    visitsWithClick: 120,
    clickThroughRate: 46.2,
    botsFiltered: 37,
    changes: { realClicks: 12.5, uniqueVisitors: 8.1, clickThroughRate: -2.3, botsFiltered: -10 },
    dailyClicks,
    hourlyClicks,
    topLinks: links.slice(0, 5).map((l, i) => ({ id: l.id, name: l.internalName || l.title, slug: l.slug, clicks: [120, 62, 41, 22, 9][i], previousClicks: [95, 70, 30, 22, 12][i] })),
    recentActivity: recent.map((country, i) => ({ id: `c${i}`, linkId: 'lnk_1', linkName: i % 2 ? 'TikTok' : 'IG bio', createdAt: new Date(Date.now() - i * 7 * 60000).toISOString(), country, device: i % 3 ? 'Mobile' : 'Desktop' })),
  }
}

function analytics(days, links) {
  const summary = Array.from({ length: days }, (_, i) => {
    const clicks = 40 + Math.round(30 * Math.sin(i / 1.7) + i * 5)
    return { date: isoDay(i - days + 1), clicks, views: clicks * 2, visitors: Math.round(clicks * 0.8), ctr: 45 }
  })
  const totalClicks = summary.reduce((sum, d) => sum + d.clicks, 0)
  return {
    summary,
    linkPerformance: links.map((l, i) => ({ id: l.id, name: l.internalName || l.title, slug: l.slug, type: l.isDirect ? 'Direct' : 'Landing page', clicks: [620, 330, 180, 90, 40][i] || 10, todayClicks: [40, 20, 9, 6, 2][i] || 1, views: 900, uniqueVisitors: 500, ctr: l.isDirect ? null : 44.5, topSource: 'Instagram' })),
    stats: {
      topCountries: [['France', 640], ['Belgium', 210], ['Canada', 160], ['Switzerland', 90]],
      topCities: [['Paris', 320], ['Lyon', 110], ['Brussels', 95]],
      topDevices: [['Mobile', 880], ['Desktop', 210]],
      topBrowsers: [['Safari', 520], ['Chrome', 460]],
      topOperatingSystems: [['iOS', 540], ['Android', 340]],
      topSources: [['Instagram', 610], ['TikTok', 290], ['Direct', 120]],
      hourlyDistribution: Array.from({ length: 24 }, (_, hour) => ({ hour, clicks: Math.round(20 + 15 * Math.sin(hour / 3)) })),
      weekdayDistribution: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => ({ day, clicks: 80 + i * 12 })),
    },
    totals: { clicks: totalClicks, views: totalClicks * 2, uniqueVisitors: Math.round(totalClicks * 0.8), ctr: 44.8, clicksGrowth: 18, viewsGrowth: 9, filteredClicks: 73, botsFiltered: 50, duplicatesFiltered: 23 },
  }
}

/**
 * Ouvre une page de l'espace membre avec les fausses donnees.
 * options.retardSession : ms avant de repondre a la session (pour voir le chargement).
 */
async function ouvrir(browser, chemin, options = {}) {
  const donnees = options.donnees || creerDonnees()
  const page = await browser.newPage()
  await page.setViewport(options.viewport || { width: 1440, height: 900 })
  if (options.calme) await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }])
  page.on('dialog', dialog => dialog.accept())
  const erreurs = []
  page.on('pageerror', e => erreurs.push(e.message.slice(0, 200)))
  page.on('console', m => { if (m.type() === 'error') erreurs.push(m.text().slice(0, 200)) })
  await page.setRequestInterception(true)
  page.on('request', req => {
    const url = new URL(req.url())
    if (!url.pathname.startsWith('/api/')) return req.continue()
    const repondre = (corps, statut = 200) => req.respond({ status: statut, contentType: 'application/json', body: JSON.stringify(corps) })
    const chemin = url.pathname
    const methode = req.method()

    if (chemin === '/api/auth/session') {
      const session = { user: { id: 'u_demo', name: 'Mia Laurent', email: 'mia@example.test', image: null, username: 'mia', role: 'user', plan: 'standard', planExpiresAt: null, teamId: null, teamRole: null }, expires: '2099-12-31T00:00:00.000Z' }
      return setTimeout(() => repondre(session), options.retardSession || 0)
    }
    if (chemin.startsWith('/api/auth/')) return req.respond({ status: 200, contentType: 'text/plain', body: '' })
    if (chemin === '/api/admin/access') return repondre({ canAccess: false })
    if (chemin === '/api/sidebar-usage') return repondre({ plan: 'standard', landingPages: { used: 2, limit: -1 }, directLinks: { used: 3, limit: -1 }, socialAccounts: { used: 2, locked: false }, canManagePlan: true })
    if (chemin === '/api/profile') return repondre({ id: 'u_demo', name: 'Mia Laurent', email: 'mia@example.test', username: 'mia' })
    if (chemin === '/api/links/fast') return repondre({ personalLinks: donnees.links, teamLinks: [], hasTeam: false, links: donnees.links, count: donnees.links.length })
    if (chemin === '/api/folders' && methode === 'GET') return repondre(donnees.folders)
    if (chemin === '/api/dashboard/metrics') return repondre(metrics(url.searchParams.get('period') || 'today', donnees.links))
    if (chemin === '/api/links/click-counts') return repondre({ counts: donnees.links.map(l => ({ id: l.id, clicks: l.clicks })) })
    if (chemin === '/api/analytics/charts') return repondre(analytics(Number(url.searchParams.get('days') || 7), donnees.links))
    if (chemin === '/api/links/toggle' && methode === 'PATCH') {
      const corps = JSON.parse(req.postData() || '{}')
      const lien = donnees.links.find(l => l.id === corps.linkId)
      if (lien) lien.isActive = corps.isActive
      // Pour voir l'arrivee d'un lien : un lien "cree ailleurs" apparait au rafraichissement suivant.
      if (donnees.ajouterAuProchainBasculement) {
        donnees.ajouterAuProchainBasculement = false
        const now = new Date().toISOString()
        donnees.links.unshift({ id: 'lnk_new', title: 'Podcast', internalName: 'Podcast', slug: 'mia-podcast', isActive: true, isDirect: true, directUrl: 'https://podcast.example.com/mia', multiLinks: [], clicks: 0, folderId: 'fld_1', canDelete: true, order: 0, createdAt: now, updatedAt: now })
      }
      return repondre({ success: true })
    }
    if (chemin.startsWith('/api/links/') && methode === 'DELETE') {
      const id = chemin.split('/')[3]
      donnees.links = donnees.links.filter(l => l.id !== id)
      return repondre({ success: true })
    }
    return repondre({})
  })
  await page.goto(BASE + chemin, { waitUntil: 'domcontentloaded', timeout: 180000 })
  return { page, donnees, erreurs }
}

async function photo(page, dossier, nom) {
  await page.evaluate(() => document.querySelector('nextjs-portal')?.remove())
  await page.screenshot({ path: `${dossier}/${nom}.png` })
}

async function serie(page, dossier, nom, instants) {
  const t0 = Date.now()
  for (const t of instants) {
    const reste = t - (Date.now() - t0)
    if (reste > 0) await pause(reste)
    await photo(page, dossier, `${nom}-${String(t).padStart(5, '0')}`)
  }
}

async function lancer() {
  return puppeteer.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: 'new', args: ['--hide-scrollbars'] })
}

module.exports = { lancer, ouvrir, photo, serie, pause, creerDonnees, BASE }
