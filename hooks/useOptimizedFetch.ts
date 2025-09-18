import { useState, useEffect, useCallback, useRef } from 'react'

interface FetchOptions extends RequestInit {
  cache?: boolean
  cacheTime?: number // en secondes
  retry?: number
  retryDelay?: number
  dedupe?: boolean // Éviter les requêtes doubles
}

interface FetchState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

// Cache global pour éviter les requêtes doubles
const globalCache = new Map<string, { data: any, timestamp: number }>()
const pendingRequests = new Map<string, Promise<any>>()

export function useOptimizedFetch<T = any>(
  url: string,
  options: FetchOptions = {}
): FetchState<T> {
  const {
    cache = true,
    cacheTime = 60,
    retry = 3,
    retryDelay = 1000,
    dedupe = true,
    ...fetchOptions
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const mountedRef = useRef(true)

  const fetchData = useCallback(async (retryCount = 0): Promise<void> => {
    const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`

    try {
      // Vérifier le cache en premier
      if (cache && globalCache.has(cacheKey)) {
        const cached = globalCache.get(cacheKey)!
        if (Date.now() - cached.timestamp < cacheTime * 1000) {
          console.log('✨ Cache hit pour:', url)
          setData(cached.data)
          setLoading(false)
          return
        } else {
          globalCache.delete(cacheKey)
        }
      }

      // Éviter les requêtes doubles si dedupe est activé
      if (dedupe && pendingRequests.has(cacheKey)) {
        console.log('⏳ Requête en cours, attente...', url)
        const result = await pendingRequests.get(cacheKey)
        if (mountedRef.current) {
          setData(result)
          setLoading(false)
        }
        return
      }

      // Créer un nouveau AbortController
      abortControllerRef.current = new AbortController()

      // Créer la promesse de requête
      const fetchPromise = (async () => {
        const response = await fetch(url, {
          ...fetchOptions,
          signal: abortControllerRef.current?.signal,
          // Optimisations de performance
          headers: {
            ...fetchOptions.headers,
            'Accept': 'application/json',
            'Cache-Control': cache ? 'max-age=60' : 'no-cache'
          }
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()

        // Mettre en cache si activé
        if (cache) {
          globalCache.set(cacheKey, {
            data: result,
            timestamp: Date.now()
          })
        }

        return result
      })()

      // Enregistrer la requête en cours
      if (dedupe) {
        pendingRequests.set(cacheKey, fetchPromise)
      }

      // Attendre le résultat
      const result = await fetchPromise

      if (mountedRef.current) {
        setData(result)
        setError(null)
        setLoading(false)
      }

    } catch (err) {
      // Ne pas traiter les erreurs d'annulation
      if (err instanceof Error && err.name === 'AbortError') {
        console.log('🚫 Requête annulée:', url)
        return
      }

      console.error('❌ Erreur fetch:', url, err)

      // Retry logic
      if (retryCount < retry - 1) {
        console.log(`🔄 Retry ${retryCount + 1}/${retry} pour:`, url)
        await new Promise(resolve => setTimeout(resolve, retryDelay))
        return fetchData(retryCount + 1)
      }

      if (mountedRef.current) {
        setError(err as Error)
        setLoading(false)
      }
    } finally {
      // Nettoyer la requête en cours
      if (dedupe) {
        pendingRequests.delete(cacheKey)
      }
    }
  }, [url, cache, cacheTime, retry, retryDelay, dedupe, fetchOptions])

  const refetch = useCallback(async () => {
    // Annuler la requête en cours si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Effacer le cache pour forcer un nouveau fetch
    const cacheKey = `${url}_${JSON.stringify(fetchOptions)}`
    globalCache.delete(cacheKey)

    setLoading(true)
    setError(null)
    await fetchData()
  }, [url, fetchOptions, fetchData])

  useEffect(() => {
    mountedRef.current = true
    fetchData()

    return () => {
      mountedRef.current = false
      // Annuler la requête si le composant est démonté
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  return { data, loading, error, refetch }
}

// Hook spécialisé pour les analytics avec cache plus long
export function useAnalytics(userId?: string) {
  const url = userId ? `/api/analytics/${userId}` : '/api/analytics'
  return useOptimizedFetch(url, {
    cache: true,
    cacheTime: 300, // 5 minutes
    retry: 2
  })
}

// Hook spécialisé pour les liens avec cache court
export function useLinksOptimized() {
  return useOptimizedFetch('/api/links', {
    cache: true,
    cacheTime: 30, // 30 secondes
    retry: 3,
    dedupe: true
  })
}

// Fonction pour précharger des données
export async function prefetchData(url: string, cacheTime = 60) {
  const cacheKey = `${url}_{}`

  // Vérifier si déjà en cache
  if (globalCache.has(cacheKey)) {
    const cached = globalCache.get(cacheKey)!
    if (Date.now() - cached.timestamp < cacheTime * 1000) {
      return cached.data
    }
  }

  try {
    const response = await fetch(url)
    if (response.ok) {
      const data = await response.json()
      globalCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })
      return data
    }
  } catch (err) {
    console.error('Erreur prefetch:', url, err)
  }
}

// Nettoyer le cache périodiquement
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of globalCache.entries()) {
      // Supprimer les entrées de plus de 10 minutes
      if (now - value.timestamp > 600000) {
        globalCache.delete(key)
      }
    }
  }, 60000) // Toutes les minutes
}