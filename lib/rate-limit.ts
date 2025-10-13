/**
 * Rate Limiting Utility
 * Protection contre brute force et spam
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetAt: number
  }
}

// Store en mémoire (pour production, utiliser Redis)
const store: RateLimitStore = {}

// Nettoyer les entrées expirées toutes les 5 minutes
setInterval(() => {
  const now = Date.now()
  Object.keys(store).forEach(key => {
    if (store[key].resetAt < now) {
      delete store[key]
    }
  })
}, 5 * 60 * 1000)

export interface RateLimitConfig {
  /**
   * Nombre maximum de tentatives autorisées
   */
  maxAttempts: number

  /**
   * Fenêtre de temps en millisecondes
   */
  windowMs: number

  /**
   * Message d'erreur personnalisé (optionnel)
   */
  message?: string
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
  message?: string
}

/**
 * Vérifie si une requête est autorisée selon les limites de taux
 *
 * @param identifier - Identifiant unique (IP, email, etc.)
 * @param config - Configuration du rate limiting
 * @returns Résultat avec success, remaining, resetAt
 *
 * @example
 * // Limiter à 5 tentatives de connexion par 15 minutes
 * const result = checkRateLimit(userEmail, {
 *   maxAttempts: 5,
 *   windowMs: 15 * 60 * 1000,
 *   message: 'Trop de tentatives. Réessayez dans 15 minutes.'
 * })
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig
): RateLimitResult {
  const now = Date.now()
  const key = identifier.toLowerCase().trim()

  // Récupérer ou créer l'entrée
  let entry = store[key]

  if (!entry || entry.resetAt < now) {
    // Nouvelle fenêtre
    entry = {
      count: 0,
      resetAt: now + config.windowMs
    }
    store[key] = entry
  }

  // Incrémenter le compteur
  entry.count++

  // Vérifier la limite
  if (entry.count > config.maxAttempts) {
    const waitTime = Math.ceil((entry.resetAt - now) / 1000 / 60)
    return {
      success: false,
      remaining: 0,
      resetAt: entry.resetAt,
      message: config.message || `Trop de tentatives. Réessayez dans ${waitTime} minute${waitTime > 1 ? 's' : ''}.`
    }
  }

  return {
    success: true,
    remaining: config.maxAttempts - entry.count,
    resetAt: entry.resetAt
  }
}

/**
 * Réinitialise le compteur pour un identifiant
 * Utile après une action réussie
 *
 * @param identifier - Identifiant à réinitialiser
 *
 * @example
 * // Après connexion réussie
 * resetRateLimit(userEmail)
 */
export function resetRateLimit(identifier: string): void {
  const key = identifier.toLowerCase().trim()
  delete store[key]
}

/**
 * Configurations prédéfinies
 */
export const RateLimitPresets = {
  /**
   * Pour les tentatives de connexion
   * Max 5 tentatives par 15 minutes
   */
  AUTH_LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000,
    message: 'Trop de tentatives de connexion. Réessayez dans 15 minutes.'
  } as RateLimitConfig,

  /**
   * Pour l'inscription
   * Max 3 comptes par heure par IP
   */
  AUTH_REGISTER: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Trop d\'inscriptions. Réessayez dans 1 heure.'
  } as RateLimitConfig,

  /**
   * Pour le reset password
   * Max 3 demandes par heure
   */
  AUTH_RESET_PASSWORD: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000,
    message: 'Trop de demandes de réinitialisation. Réessayez dans 1 heure.'
  } as RateLimitConfig,

  /**
   * Pour les clics sur liens (analytics)
   * Max 10 clics par minute par IP
   */
  TRACK_CLICK: {
    maxAttempts: 10,
    windowMs: 60 * 1000,
    message: 'Trop de clics. Réessayez dans 1 minute.'
  } as RateLimitConfig,

  /**
   * Pour les API générales
   * Max 100 requêtes par minute
   */
  API_GENERAL: {
    maxAttempts: 100,
    windowMs: 60 * 1000,
    message: 'Limite de requêtes atteinte. Réessayez dans 1 minute.'
  } as RateLimitConfig
} as const

/**
 * Helper pour extraire l'IP d'une requête Next.js
 */
export function getClientIP(request: Request): string {
  const headers = new Headers(request.headers)

  // Essayer différentes sources d'IP
  const forwardedFor = headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  const realIP = headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  // Fallback pour localhost en dev
  return '127.0.0.1'
}
