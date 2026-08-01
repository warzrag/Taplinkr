import { domainToASCII } from 'node:url'

export class InvalidCustomDomainError extends Error {}

export function normalizeCustomDomain(input: string) {
  const raw = input.trim().toLowerCase().replace(/\.$/, '')
  const withoutProtocol = raw.replace(/^https?:\/\//, '').split('/')[0]
  const withoutPort = withoutProtocol.replace(/:\d+$/, '')
  const ascii = domainToASCII(withoutPort)

  if (!ascii || ascii.length > 253 || !ascii.includes('.')) {
    throw new InvalidCustomDomainError('Enter a valid domain, such as creator.com.')
  }

  const labels = ascii.split('.')
  const valid = labels.every(label => (
    label.length > 0 &&
    label.length <= 63 &&
    /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
  ))

  if (!valid || /^\d+(?:\.\d+){3}$/.test(ascii)) {
    throw new InvalidCustomDomainError('Enter a valid domain, such as creator.com.')
  }

  if (
    ascii === 'taplinkr.com' ||
    ascii.endsWith('.taplinkr.com') ||
    ascii.endsWith('.vercel.app') ||
    ascii === 'localhost'
  ) {
    throw new InvalidCustomDomainError('This domain cannot be used as a custom domain.')
  }

  return ascii
}
