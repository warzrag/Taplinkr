import { createHmac, timingSafeEqual } from 'crypto'

function secret() {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('NEXTAUTH_SECRET is required')
  return value
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createSignedToken(purpose: string, subject: string, expiresAt: number, notBefore = 0) {
  const payload = Buffer.from(JSON.stringify({ purpose, subject, expiresAt, notBefore })).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function verifySignedToken(
  token: string | undefined,
  purpose: string,
  subject: string,
  options: { enforceNotBefore?: boolean } = {},
) {
  if (!token) return false

  try {
    const [payload, suppliedSignature, extra] = token.split('.')
    if (!payload || !suppliedSignature || extra) return false

    const expected = Buffer.from(signature(payload))
    const supplied = Buffer.from(suppliedSignature)
    if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return false

    const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as {
      purpose: string
      subject: string
      expiresAt: number
      notBefore?: number
    }
    const now = Date.now()

    return parsed.purpose === purpose &&
      parsed.subject === subject &&
      Number.isFinite(parsed.expiresAt) &&
      parsed.expiresAt > now &&
      (!options.enforceNotBefore || !parsed.notBefore || parsed.notBefore <= now)
  } catch {
    return false
  }
}

export function passwordCookieName(linkId: string) {
  return `taplinkr_verified_${linkId}`
}
