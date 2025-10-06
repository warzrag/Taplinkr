const https = require('https')

const url = 'https://www.taplinkr.com/api/analytics/dashboard-all'

https.get(url, {
  headers: {
    'Cookie': 'next-auth.session-token=YOUR_TOKEN'
  }
}, (res) => {
  let data = ''
  res.on('data', chunk => data += chunk)
  res.on('end', () => {
    const json = JSON.parse(data)
    console.log('\n📊 Réponse API dashboard-all:\n')
    console.log('Total clics:', json.totalClicks)
    console.log('Top countries:', json.topCountries)
    console.log('\nFormat attendu: [[code_pays, nb_clics], ...]')
  })
}).on('error', err => console.error(err))
