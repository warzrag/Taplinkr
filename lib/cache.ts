// Cache en mémoire pour les données fréquemment accédées
class MemoryCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map()
  private ttl: number = 60000 // 1 minute par défaut

  set(key: string, data: any, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now() + (ttl || this.ttl)
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() > item.timestamp) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): void {
    this.cache.delete(key)
  }
}

// Instance singleton
export const memoryCache = new MemoryCache()

// Cache pour les requêtes API
export async function cachedFetch(
  key: string,
  fetcher: () => Promise<any>,
  ttl?: number
): Promise<any> {
  // Vérifier le cache
  const cached = memoryCache.get(key)
  if (cached) {
    console.log('Cache hit:', key)
    return cached
  }

  // Fetch et mettre en cache
  console.log('Cache miss:', key)
  const data = await fetcher()
  memoryCache.set(key, data, ttl)
  return data
}