const PUBLIC_SLUG_ALPHABET = 'abcdefghjkmnpqrstuvwxyz23456789'
const PUBLIC_SLUG_LENGTH = 8

export function createShortPublicSlug(randomBytes?: Uint8Array): string {
  const bytes = randomBytes || crypto.getRandomValues(new Uint8Array(PUBLIC_SLUG_LENGTH))

  return Array.from(bytes.slice(0, PUBLIC_SLUG_LENGTH), byte => (
    PUBLIC_SLUG_ALPHABET[byte % PUBLIC_SLUG_ALPHABET.length]
  )).join('')
}
