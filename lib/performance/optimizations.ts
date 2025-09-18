// Optimisations de performance globales

// 1. Préchargement des routes critiques
export const criticalRoutes = [
  '/dashboard',
  '/dashboard/links',
  '/dashboard/analytics',
  '/settings'
]

// 2. Configuration du prefetch pour les images
export const imageConfig = {
  priority: true, // Pour les images above the fold
  loading: 'eager' as const, // Pour les images critiques
  quality: 85,
  sizes: '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
}

// 3. Debounce pour les recherches et filtres
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), wait)
  }
}

// 4. Throttle pour les événements fréquents
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

// 5. Mise en cache des données avec TTL
export class DataCache {
  private cache = new Map<string, { data: any, timestamp: number }>()
  private ttl: number

  constructor(ttlSeconds: number = 300) { // 5 minutes par défaut
    this.ttl = ttlSeconds * 1000
  }

  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get(key: string) {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  clear() {
    this.cache.clear()
  }
}

// 6. Optimisation des requêtes API avec mise en cache
export async function fetchWithCache(
  url: string,
  options?: RequestInit,
  cacheKey?: string,
  ttl: number = 60
): Promise<any> {
  const key = cacheKey || url

  // Vérifier le cache du navigateur
  if (typeof window !== 'undefined') {
    const cached = sessionStorage.getItem(`api_cache_${key}`)
    if (cached) {
      const { data, timestamp } = JSON.parse(cached)
      if (Date.now() - timestamp < ttl * 1000) {
        console.log('✨ Cache hit:', key)
        return data
      }
    }
  }

  // Faire la requête
  const response = await fetch(url, {
    ...options,
    // Ajouter des headers pour optimiser le cache HTTP
    headers: {
      ...options?.headers,
      'Cache-Control': 'max-age=60'
    }
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)

  const data = await response.json()

  // Sauvegarder dans le cache
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(`api_cache_${key}`, JSON.stringify({
      data,
      timestamp: Date.now()
    }))
  }

  return data
}

// 7. Lazy loading des composants lourds
export const lazyLoadConfig = {
  rootMargin: '50px',
  threshold: 0.01
}

// 8. Optimisation des animations
export const animationConfig = {
  // Désactiver les animations si l'utilisateur préfère
  reduced: typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Durées optimisées
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.3,
    slow: 0.5
  },

  // Easing optimisé
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
}

// 9. Batch des mises à jour DOM
export function batchUpdates(updates: (() => void)[]) {
  requestAnimationFrame(() => {
    updates.forEach(update => update())
  })
}

// 10. Préchargement des ressources critiques
export function preloadCriticalResources() {
  if (typeof window === 'undefined') return

  // Précharger les fonts
  const fonts = [
    '/fonts/Inter-Regular.woff2',
    '/fonts/Inter-Medium.woff2',
    '/fonts/SpaceGrotesk-Medium.woff2'
  ]

  fonts.forEach(font => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'font'
    link.type = 'font/woff2'
    link.href = font
    link.crossOrigin = 'anonymous'
    document.head.appendChild(link)
  })

  // Précharger les images critiques
  const criticalImages = [
    '/logo.svg',
    '/hero-mobile.webp'
  ]

  criticalImages.forEach(image => {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = image
    document.head.appendChild(link)
  })
}