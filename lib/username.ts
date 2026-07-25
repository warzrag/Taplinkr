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
      error: 'Username must be 3–30 characters and use only letters, numbers, hyphens, and underscores',
    }
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { valid: false, error: 'This username is reserved' }
  }

  return { valid: true, username }
}
