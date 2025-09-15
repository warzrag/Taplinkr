// Script de test pour vérifier le système de tracking
// À exécuter avec: node test-tracking.js

const testTracking = async () => {
  console.log('🧪 Test du système de tracking TapLinkr...\n')

  // Remplacer par un ID de lien valide de votre base de données
  const TEST_LINK_ID = 'YOUR_LINK_ID_HERE'
  const BASE_URL = 'http://localhost:3000'

  // Données de test
  const trackingData = {
    linkId: TEST_LINK_ID,
    referrer: 'https://google.com/search?q=taplinkr',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    screenResolution: '1920x1080',
    language: 'fr-FR',
    timezone: 'Europe/Paris',
    timestamp: new Date().toISOString()
  }

  try {
    // Test 1: Tracker une vue
    console.log('📊 Test 1: Tracking d\'une vue de page...')
    const viewResponse = await fetch(`${BASE_URL}/api/track-link-view`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '82.66.123.45' // IP française pour test
      },
      body: JSON.stringify(trackingData)
    })

    const viewResult = await viewResponse.json()
    console.log('Résultat:', viewResult)
    console.log('✅ Vue trackée avec succès!\n')

    // Test 2: Vérifier les visiteurs
    console.log('👥 Test 2: Récupération des visiteurs...')
    const visitorsResponse = await fetch(`${BASE_URL}/api/analytics/visitors?page=1&limit=10`)
    const visitorsResult = await visitorsResponse.json()
    
    console.log(`Nombre de visiteurs: ${visitorsResult.total}`)
    if (visitorsResult.visitors && visitorsResult.visitors.length > 0) {
      console.log('Premier visiteur:', JSON.stringify(visitorsResult.visitors[0], null, 2))
    }
    console.log('✅ Visiteurs récupérés!\n')

    // Test 3: Simuler un clic sur un multi-lien
    console.log('🖱️ Test 3: Tracking d\'un clic (si vous avez des multi-liens)...')
    // Remplacer par un ID de multi-lien valide
    const MULTI_LINK_ID = 'YOUR_MULTILINK_ID_HERE'
    
    const clickResponse = await fetch(`${BASE_URL}/api/track-multilink-click`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': '82.66.123.45'
      },
      body: JSON.stringify({ multiLinkId: MULTI_LINK_ID })
    })

    if (clickResponse.ok) {
      console.log('✅ Clic tracké avec succès!')
    } else {
      console.log('⚠️ Pas de multi-lien à tester')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }

  console.log('\n🎉 Test terminé!')
}

// Instructions
console.log('=== INSTRUCTIONS ===')
console.log('1. Remplacez TEST_LINK_ID par un ID de lien valide de votre DB')
console.log('2. Assurez-vous que votre serveur Next.js tourne sur localhost:3000')
console.log('3. Exécutez: node test-tracking.js')
console.log('===================\n')

// Décommenter pour exécuter le test
// testTracking()