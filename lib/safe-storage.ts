/**
 * Safe LocalStorage Utility
 * Gère automatiquement le quota et nettoie l'espace si nécessaire
 */

/**
 * Taille estimée d'une valeur en bytes
 */
function getItemSize(value: string): number {
  return new Blob([value]).size
}

/**
 * Obtient la taille totale utilisée dans localStorage (en bytes)
 */
export function getLocalStorageSize(): number {
  let total = 0
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (value) {
        total += getItemSize(key) + getItemSize(value)
      }
    }
  }
  return total
}

/**
 * Obtient la taille totale utilisée en MB
 */
export function getLocalStorageSizeMB(): string {
  return (getLocalStorageSize() / 1024 / 1024).toFixed(2)
}

/**
 * Nettoie les vieux caches et données temporaires
 *
 * @param patterns - Patterns de clés à nettoyer (default: caches)
 * @returns Nombre de clés supprimées
 */
export function cleanOldCaches(patterns: string[] = ['cache', 'links-', 'dashboard-', 'folders-']): number {
  const keysToRemove: string[] = []

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      // Vérifier si la clé correspond à un pattern
      const shouldRemove = patterns.some(pattern => key.includes(pattern))
      if (shouldRemove) {
        keysToRemove.push(key)
      }
    }
  }

  keysToRemove.forEach(key => {
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Erreur suppression clé ${key}:`, error)
    }
  })

  console.log(`🧹 Nettoyage localStorage: ${keysToRemove.length} clés supprimées`)
  return keysToRemove.length
}

/**
 * Sauvegarde une valeur dans localStorage de manière sûre
 * Gère automatiquement QuotaExceededError avec nettoyage
 *
 * @param key - Clé de stockage
 * @param value - Valeur à stocker (sera stringifiée si objet)
 * @param options - Options
 * @returns true si sauvegarde réussie
 */
export function safeSetItem(
  key: string,
  value: any,
  options: {
    /** Nettoyer automatiquement si quota dépassé (default: true) */
    autoClean?: boolean
    /** Patterns de clés à nettoyer en cas de quota dépassé */
    cleanPatterns?: string[]
  } = {}
): boolean {
  const { autoClean = true, cleanPatterns = ['cache', 'links-', 'dashboard-', 'folders-'] } = options

  try {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
    localStorage.setItem(key, stringValue)
    return true
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn(`⚠️ QuotaExceededError lors de la sauvegarde de '${key}'`)
      console.warn(`📊 Taille localStorage: ${getLocalStorageSizeMB()} MB`)

      if (!autoClean) {
        console.error('❌ AutoClean désactivé - Sauvegarde impossible')
        return false
      }

      console.log('🧹 Nettoyage automatique des vieux caches...')
      const cleaned = cleanOldCaches(cleanPatterns)

      if (cleaned === 0) {
        console.error('❌ Aucun cache à nettoyer - Sauvegarde impossible')
        return false
      }

      // Réessayer après nettoyage
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value)
        localStorage.setItem(key, stringValue)
        console.log(`✅ Sauvegarde réussie après nettoyage de ${cleaned} clés`)
        console.log(`📊 Nouvelle taille: ${getLocalStorageSizeMB()} MB`)
        return true
      } catch (retryError) {
        console.error('❌ Sauvegarde impossible même après nettoyage')
        return false
      }
    }

    console.error(`❌ Erreur lors de la sauvegarde de '${key}':`, error)
    return false
  }
}

/**
 * Récupère une valeur depuis localStorage de manière sûre
 *
 * @param key - Clé de stockage
 * @param parse - Parser en JSON automatiquement (default: true)
 * @returns La valeur ou null
 */
export function safeGetItem<T = any>(key: string, parse: boolean = true): T | null {
  try {
    const value = localStorage.getItem(key)
    if (!value) return null

    if (parse) {
      try {
        return JSON.parse(value) as T
      } catch {
        // Si parsing échoue, retourner la string brute
        return value as any
      }
    }

    return value as any
  } catch (error) {
    console.error(`❌ Erreur lors de la lecture de '${key}':`, error)
    return null
  }
}

/**
 * Supprime une valeur de localStorage de manière sûre
 *
 * @param key - Clé à supprimer
 * @returns true si suppression réussie
 */
export function safeRemoveItem(key: string): boolean {
  try {
    localStorage.removeItem(key)
    return true
  } catch (error) {
    console.error(`❌ Erreur lors de la suppression de '${key}':`, error)
    return false
  }
}

/**
 * Nettoie complètement localStorage (DANGER)
 * À utiliser uniquement en dernier recours
 */
export function clearAllStorage(): void {
  try {
    const size = getLocalStorageSizeMB()
    localStorage.clear()
    console.log(`🧹 LocalStorage complètement vidé (${size} MB libérés)`)
  } catch (error) {
    console.error('❌ Erreur lors du vidage complet:', error)
  }
}

/**
 * Affiche un rapport de l'utilisation du localStorage dans la console
 */
export function logStorageReport(): void {
  console.group('📊 Rapport LocalStorage')
  console.log(`Taille totale: ${getLocalStorageSizeMB()} MB`)
  console.log(`Nombre de clés: ${localStorage.length}`)

  // Lister les plus grosses clés
  const sizes: { key: string; size: number }[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key) {
      const value = localStorage.getItem(key)
      if (value) {
        sizes.push({
          key,
          size: getItemSize(value)
        })
      }
    }
  }

  sizes.sort((a, b) => b.size - a.size)
  console.log('Top 10 des clés les plus volumineuses:')
  sizes.slice(0, 10).forEach(({ key, size }) => {
    console.log(`  - ${key}: ${(size / 1024).toFixed(2)} KB`)
  })

  console.groupEnd()
}
