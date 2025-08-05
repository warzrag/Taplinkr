// Cache en mémoire pour la géolocalisation
// Évite de faire trop d'appels API pour la même IP

interface CacheEntry {
  data: any
  timestamp: number
}

class GeoCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL = 24 * 60 * 60 * 1000 // 24 heures en millisecondes

  get(ip: string): any | null {
    const entry = this.cache.get(ip)
    if (!entry) return null

    // Vérifier si l'entrée est expirée
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(ip)
      return null
    }

    return entry.data
  }

  set(ip: string, data: any): void {
    this.cache.set(ip, {
      data,
      timestamp: Date.now()
    })

    // Limiter la taille du cache à 1000 entrées
    if (this.cache.size > 1000) {
      // Supprimer les 100 plus anciennes entrées
      const entries = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100)
      
      entries.forEach(([key]) => this.cache.delete(key))
    }
  }

  clear(): void {
    this.cache.clear()
  }
}

// Instance unique du cache
export const geoCache = new GeoCache()