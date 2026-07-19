export const RESERVED_USERNAMES = new Set([
  'api', 'app', 'admin', 'dashboard', 'auth', 'login', 'signup', 'signin',
  'settings', 'profile', 'user', 'users', 'team', 'teams', 'help', 'support',
  'about', 'privacy', 'terms', 'legal', 'cookies', 'pricing', 'blog', 'news',
  'contact', 'home', 'www', 'mail', 'ftp', 'email', 'test', 'demo', 'root',
  'public',
])

export function normalizeUsername(value: unknown): string {
  return typeof value === 'string' ? value.trim().toLowerCase() : ''
}
export function validateUsername(value: unknown): { valid: true; username: string } | { valid: false; error: string } {
  const username = normalizeUsername(value)

  if (!/^[a-z0-9_-]{3,30}$/.test(username)) {
    return {
      valid: false,
      error: "Le nom d’utilisateur doit contenir entre 3 et 30 caractères (lettres, chiffres, tirets et underscores uniquement)",
    }
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, error: "Ce nom d’utilisateur est réservé" }
  }

  return { valid: true, username }
}
