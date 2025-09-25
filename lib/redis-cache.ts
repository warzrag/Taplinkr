// Cache Redis-like en mémoire avec expiration avancée
interface CacheEntry {
  data: any
  expires: number
  hits: number
  lastAccess: number
}

class RedisLikeCache {
  private cache: Map<string, CacheEntry> = new Map()
  private maxSize: number = 1000
  private gcInterval: NodeJS.Timeout | null = null

  constructor() {
    // Nettoyer les entrées expirées toutes les 5 minutes
    this.gcInterval = setInterval(() => this.gc(), 5 * 60 * 1000)
  }

  // SET avec expiration
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    // Gérer la taille max
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    this.cache.set(key, {
      data: value,
      expires: Date.now() + (ttl * 1000),
      hits: 0,
      lastAccess: Date.now()
    })
  }

  // GET avec mise à jour des stats
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key)

    if (!entry) return null

    // Vérifier l'expiration
    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return null
    }

    // Mettre à jour les stats
    entry.hits++
    entry.lastAccess = Date.now()

    return entry.data
  }

  // EXISTS
  async exists(key: string): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false

    if (Date.now() > entry.expires) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  // DEL
  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  // FLUSHALL
  async flushAll(): Promise<void> {
    this.cache.clear()
  }

  // EXPIRE - changer le TTL
  async expire(key: string, ttl: number): Promise<boolean> {
    const entry = this.cache.get(key)
    if (!entry) return false

    entry.expires = Date.now() + (ttl * 1000)
    return true
  }

  // TTL - obtenir le temps restant
  async ttl(key: string): Promise<number> {
    const entry = this.cache.get(key)
    if (!entry) return -2 // Key doesn't exist

    const remaining = Math.floor((entry.expires - Date.now()) / 1000)
    return remaining > 0 ? remaining : -1 // Expired
  }

  // INCR - incrémenter une valeur numérique
  async incr(key: string): Promise<number> {
    const value = await this.get(key)
    const newValue = (typeof value === 'number' ? value : 0) + 1
    await this.set(key, newValue, 3600)
    return newValue
  }

  // MGET - obtenir plusieurs clés
  async mget(keys: string[]): Promise<(any | null)[]> {
    return Promise.all(keys.map(key => this.get(key)))
  }

  // MSET - définir plusieurs clés
  async mset(pairs: Array<{ key: string; value: any; ttl?: number }>): Promise<void> {
    for (const { key, value, ttl } of pairs) {
      await this.set(key, value, ttl)
    }
  }

  // Nettoyer les entrées expirées
  private gc(): void {
    const now = Date.now()
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        this.cache.delete(key)
      }
    }
  }

  // Éviction LRU (Least Recently Used)
  private evictLRU(): void {
    let oldestKey: string | null = null
    let oldestTime = Infinity

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess
        oldestKey = key
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey)
    }
  }

  // Statistiques du cache
  getStats(): {
    size: number
    maxSize: number
    hitRate: number
    totalHits: number
  } {
    let totalHits = 0
    let totalRequests = 0

    for (const entry of this.cache.values()) {
      totalHits += entry.hits
      totalRequests++
    }

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      totalHits
    }
  }

  // Nettoyer le timer
  destroy(): void {
    if (this.gcInterval) {
      clearInterval(this.gcInterval)
    }
  }
}

// Singleton pour l'application
let cacheInstance: RedisLikeCache | null = null

export function getCache(): RedisLikeCache {
  if (!cacheInstance) {
    cacheInstance = new RedisLikeCache()
  }
  return cacheInstance
}

// Helper functions pour simplifier l'usage
export const cache = {
  get: (key: string) => getCache().get(key),
  set: (key: string, value: any, ttl?: number) => getCache().set(key, value, ttl),
  del: (key: string) => getCache().del(key),
  exists: (key: string) => getCache().exists(key),
  expire: (key: string, ttl: number) => getCache().expire(key, ttl),
  ttl: (key: string) => getCache().ttl(key),
  incr: (key: string) => getCache().incr(key),
  mget: (keys: string[]) => getCache().mget(keys),
  mset: (pairs: Array<{ key: string; value: any; ttl?: number }>) => getCache().mset(pairs),
  flushAll: () => getCache().flushAll(),
  stats: () => getCache().getStats()
}