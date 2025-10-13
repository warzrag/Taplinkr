/**
 * URL Validation Utility
 * Protection contre XSS via URLs malveillantes (javascript:, data:, etc.)
 */

/**
 * Protocoles autorisés pour les URLs
 * Whitelist stricte pour éviter XSS
 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'] as const

/**
 * Protocoles dangereux à rejeter explicitement
 */
const DANGEROUS_PROTOCOLS = [
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'about:',
] as const

/**
 * Valide une URL et vérifie qu'elle n'utilise que des protocoles sûrs
 *
 * @param url - L'URL à valider
 * @param allowRelative - Autoriser les URLs relatives (default: false)
 * @returns true si l'URL est valide et sûre
 *
 * @example
 * validateURL('https://example.com') // ✅ true
 * validateURL('http://example.com')  // ✅ true
 * validateURL('javascript:alert(1)') // ❌ false
 * validateURL('data:text/html,<script>alert(1)</script>') // ❌ false
 */
export function validateURL(url: string, allowRelative: boolean = false): boolean {
  if (!url || typeof url !== 'string') {
    return false
  }

  // Trim et normaliser
  const trimmedUrl = url.trim()

  if (!trimmedUrl) {
    return false
  }

  // Vérifier les protocoles dangereux en premier (case-insensitive)
  const lowerUrl = trimmedUrl.toLowerCase()
  for (const dangerous of DANGEROUS_PROTOCOLS) {
    if (lowerUrl.startsWith(dangerous)) {
      console.warn(`🚫 URL dangereuse rejetée (${dangerous}):`, url)
      return false
    }
  }

  // Autoriser les URLs relatives si demandé
  if (allowRelative && (trimmedUrl.startsWith('/') || trimmedUrl.startsWith('./'))) {
    return true
  }

  // Parser l'URL
  let parsedUrl: URL
  try {
    parsedUrl = new URL(trimmedUrl)
  } catch (error) {
    return false
  }

  // Vérifier que le protocole est dans la whitelist
  if (!ALLOWED_PROTOCOLS.includes(parsedUrl.protocol as any)) {
    console.warn(`🚫 Protocole non autorisé (${parsedUrl.protocol}):`, url)
    return false
  }

  // Vérifications supplémentaires
  // Rejeter les URLs avec username/password (risque de phishing)
  if (parsedUrl.username || parsedUrl.password) {
    console.warn('🚫 URL avec credentials rejetée:', url)
    return false
  }

  return true
}

/**
 * Valide et nettoie une URL
 * Retourne l'URL nettoyée ou null si invalide
 *
 * @param url - L'URL à valider et nettoyer
 * @returns L'URL nettoyée ou null
 *
 * @example
 * sanitizeURL('  https://example.com  ') // 'https://example.com'
 * sanitizeURL('javascript:alert(1)')     // null
 */
export function sanitizeURL(url: string): string | null {
  if (!validateURL(url)) {
    return null
  }

  try {
    const parsed = new URL(url.trim())
    // Retourner l'URL normalisée
    return parsed.toString()
  } catch {
    return null
  }
}

/**
 * Valide une liste d'URLs (pour multiLinks par exemple)
 *
 * @param urls - Tableau d'URLs à valider
 * @returns Objet avec isValid et détails des erreurs
 *
 * @example
 * validateURLs(['https://example.com', 'javascript:alert(1)'])
 * // {
 * //   isValid: false,
 * //   validCount: 1,
 * //   invalidCount: 1,
 * //   invalidURLs: ['javascript:alert(1)']
 * // }
 */
export function validateURLs(urls: string[]): {
  isValid: boolean
  validCount: number
  invalidCount: number
  invalidURLs: string[]
} {
  const invalidURLs: string[] = []

  for (const url of urls) {
    if (!validateURL(url)) {
      invalidURLs.push(url)
    }
  }

  return {
    isValid: invalidURLs.length === 0,
    validCount: urls.length - invalidURLs.length,
    invalidCount: invalidURLs.length,
    invalidURLs
  }
}

/**
 * Extrait le domaine d'une URL de manière sûre
 *
 * @param url - L'URL dont extraire le domaine
 * @returns Le domaine ou null
 *
 * @example
 * extractDomain('https://www.example.com/path') // 'www.example.com'
 * extractDomain('javascript:alert(1)')          // null
 */
export function extractDomain(url: string): string | null {
  if (!validateURL(url)) {
    return null
  }

  try {
    const parsed = new URL(url.trim())
    return parsed.hostname
  } catch {
    return null
  }
}

/**
 * Vérifie si une URL pointe vers un domaine spécifique
 *
 * @param url - L'URL à vérifier
 * @param domain - Le domaine attendu
 * @returns true si l'URL pointe vers ce domaine
 *
 * @example
 * isFromDomain('https://example.com/path', 'example.com') // true
 * isFromDomain('https://evil.com', 'example.com')         // false
 */
export function isFromDomain(url: string, domain: string): boolean {
  const urlDomain = extractDomain(url)
  if (!urlDomain) return false

  return urlDomain === domain || urlDomain.endsWith(`.${domain}`)
}
