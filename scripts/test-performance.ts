import { cache } from '../lib/redis-cache'

async function testPerformance() {
  console.log('🚀 Test de performance du cache Redis-like')
  console.log('=========================================\n')

  // Test 1: SET et GET basique
  console.log('📝 Test 1: SET et GET basique')
  const start1 = Date.now()
  await cache.set('test:user:1', { name: 'John', age: 30 }, 60)
  const user = await cache.get('test:user:1')
  const time1 = Date.now() - start1
  console.log(`✅ SET + GET: ${time1}ms`)
  console.log(`   Données récupérées:`, user)

  // Test 2: INCR pour compteurs
  console.log('\n📊 Test 2: INCR pour compteurs')
  const start2 = Date.now()
  await cache.set('counter:views', 0, 3600)
  for (let i = 0; i < 100; i++) {
    await cache.incr('counter:views')
  }
  const views = await cache.get('counter:views')
  const time2 = Date.now() - start2
  console.log(`✅ 100 INCR: ${time2}ms`)
  console.log(`   Valeur finale: ${views}`)

  // Test 3: MSET et MGET pour batch
  console.log('\n🎯 Test 3: MSET et MGET batch')
  const start3 = Date.now()
  const batchData = Array.from({ length: 50 }, (_, i) => ({
    key: `batch:item:${i}`,
    value: { id: i, data: `Item ${i}` },
    ttl: 300
  }))
  await cache.mset(batchData)

  const keys = batchData.map(item => item.key)
  const results = await cache.mget(keys)
  const time3 = Date.now() - start3
  console.log(`✅ MSET 50 + MGET 50: ${time3}ms`)
  console.log(`   Items récupérés: ${results.filter(r => r !== null).length}/50`)

  // Test 4: TTL et expiration
  console.log('\n⏱️ Test 4: TTL et expiration')
  await cache.set('temp:key', 'temporary', 2) // 2 secondes
  const ttl1 = await cache.ttl('temp:key')
  console.log(`   TTL initial: ${ttl1} secondes`)

  await new Promise(resolve => setTimeout(resolve, 2100))
  const expired = await cache.get('temp:key')
  console.log(`   Après expiration: ${expired === null ? '✅ Expiré' : '❌ Toujours présent'}`)

  // Test 5: Stress test
  console.log('\n💪 Test 5: Stress test (1000 opérations)')
  const start5 = Date.now()
  const promises = []

  for (let i = 0; i < 1000; i++) {
    if (i % 3 === 0) {
      promises.push(cache.set(`stress:${i}`, { value: i }, 60))
    } else if (i % 3 === 1) {
      promises.push(cache.get(`stress:${i-1}`))
    } else {
      promises.push(cache.exists(`stress:${i-2}`))
    }
  }

  await Promise.all(promises)
  const time5 = Date.now() - start5
  console.log(`✅ 1000 opérations mixtes: ${time5}ms`)
  console.log(`   Moyenne par opération: ${(time5 / 1000).toFixed(2)}ms`)

  // Statistiques finales
  console.log('\n📈 Statistiques du cache:')
  const stats = cache.stats()
  console.log(`   Taille actuelle: ${stats.size}/${stats.maxSize}`)
  console.log(`   Taux de succès: ${(stats.hitRate * 100).toFixed(1)}%`)
  console.log(`   Total des hits: ${stats.totalHits}`)

  // Nettoyage
  await cache.flushAll()
  console.log('\n🧹 Cache vidé')

  console.log('\n✨ Tests terminés avec succès!')
}

// Exécuter les tests
testPerformance().catch(console.error)