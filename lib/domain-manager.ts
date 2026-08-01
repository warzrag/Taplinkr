import { prisma } from './prisma'
import { InvalidCustomDomainError, normalizeCustomDomain } from './domain-utils'

export type DnsInstruction = {
  type: 'A' | 'CNAME' | 'TXT'
  name: string
  value: string
  reason?: string
}

type VercelVerification = {
  type?: string
  domain?: string
  value?: string
  reason?: string
}

type VercelProjectDomain = {
  name?: string
  verified?: boolean
  verification?: VercelVerification[]
}

type VercelDomainConfig = {
  misconfigured?: boolean
}

export class DomainIntegrationError extends Error {
  status: number

  constructor(message: string, status = 500) {
    super(message)
    this.name = 'DomainIntegrationError'
    this.status = status
  }
}

function cleanHostname(input: string) {
  try {
    return normalizeCustomDomain(input)
  } catch (error) {
    if (error instanceof InvalidCustomDomainError) {
      throw new DomainIntegrationError(error.message, 400)
    }
    throw error
  }
}

function vercelConfig() {
  const token = process.env.VERCEL_TOKEN
  const projectId = process.env.VERCEL_PROJECT_ID
  const teamId = process.env.VERCEL_TEAM_ID

  if (!token || !projectId) {
    throw new DomainIntegrationError('Custom-domain automation is not configured yet.', 503)
  }

  return { token, projectId, teamId }
}

async function vercelRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const { token, teamId } = vercelConfig()
  const url = new URL(`https://api.vercel.com${path}`)
  if (teamId) url.searchParams.set('teamId', teamId)

  const response = await fetch(url, {
    ...init,
    cache: 'no-store',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  const payload = await response.json().catch(() => ({})) as any
  if (!response.ok) {
    const message = payload?.error?.message || payload?.message || 'Vercel could not update this domain.'
    throw new DomainIntegrationError(message, response.status)
  }

  return payload as T
}

function baseDnsInstruction(domain: string): DnsInstruction {
  const labels = domain.split('.')
  const isApex = labels.length === 2 || (labels.length === 3 && labels[labels.length - 2].length <= 3)

  if (isApex) {
    return { type: 'A', name: '@', value: '76.76.21.21' }
  }

  return {
    type: 'CNAME',
    name: labels.slice(0, -2).join('.'),
    value: 'cname.vercel-dns.com',
  }
}

function dnsInstructions(domain: string, verification: VercelVerification[] = []): DnsInstruction[] {
  const instructions: DnsInstruction[] = [baseDnsInstruction(domain)]

  for (const item of verification) {
    if (!item.value || item.type?.toUpperCase() !== 'TXT') continue
    const recordDomain = (item.domain || `_vercel.${domain}`).replace(/\.$/, '')
    const suffix = `.${domain}`
    const name = recordDomain === domain
      ? '@'
      : recordDomain.endsWith(suffix)
        ? recordDomain.slice(0, -suffix.length)
        : recordDomain

    instructions.push({
      type: 'TXT',
      name,
      value: item.value,
      reason: item.reason,
    })
  }

  return instructions
}

export function isCustomDomainAutomationConfigured() {
  return Boolean(process.env.VERCEL_TOKEN && process.env.VERCEL_PROJECT_ID)
}

export const domainManager = {
  normalizeDomain: cleanHostname,

  async addDomain(userId: string, input: { domain: string; redirectTo: string }) {
    const domain = cleanHostname(input.domain)
    const existing = await prisma.customDomain.findUnique({ where: { domain } })
    if (existing) throw new DomainIntegrationError('This domain is already connected to Taplinkr.', 409)

    const { projectId } = vercelConfig()
    const projectDomain = await vercelRequest<VercelProjectDomain>(
      `/v10/projects/${encodeURIComponent(projectId)}/domains`,
      { method: 'POST', body: JSON.stringify({ name: domain }) },
    )
    const records = dnsInstructions(domain, projectDomain.verification)

    try {
      return await prisma.customDomain.create({
        data: {
          userId,
          domain,
          subdomain: domain.split('.').length > 2 ? domain.split('.')[0] : null,
          dnsRecords: JSON.stringify(records),
          redirectTo: input.redirectTo,
          verified: false,
          sslEnabled: false,
        },
      })
    } catch (error) {
      await this.detachDomain(domain).catch(() => undefined)
      throw error
    }
  },

  async refreshDomain(domainId: string, userId: string) {
    const domain = await prisma.customDomain.findFirst({ where: { id: domainId, userId } })
    if (!domain) throw new DomainIntegrationError('Domain not found.', 404)

    const { projectId } = vercelConfig()
    let projectDomain = await vercelRequest<VercelProjectDomain>(
      `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain.domain)}`,
    )

    if (!projectDomain.verified) {
      projectDomain = await vercelRequest<VercelProjectDomain>(
        `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain.domain)}/verify`,
        { method: 'POST' },
      ).catch(error => {
        if (error instanceof DomainIntegrationError && error.status >= 400 && error.status < 500) {
          return projectDomain
        }
        throw error
      })
    }

    const config = await vercelRequest<VercelDomainConfig>(
      `/v6/domains/${encodeURIComponent(domain.domain)}/config?projectId=${encodeURIComponent(projectId)}`,
    )
    const ready = Boolean(projectDomain.verified && !config.misconfigured)
    const records = dnsInstructions(domain.domain, projectDomain.verification)

    return prisma.customDomain.update({
      where: { id: domain.id },
      data: {
        verified: ready,
        sslEnabled: ready,
        sslExpiry: null,
        dnsRecords: JSON.stringify(records),
      },
    })
  },

  async detachDomain(domain: string) {
    const { projectId } = vercelConfig()
    try {
      await vercelRequest(
        `/v9/projects/${encodeURIComponent(projectId)}/domains/${encodeURIComponent(domain)}`,
        { method: 'DELETE' },
      )
    } catch (error) {
      if (!(error instanceof DomainIntegrationError) || error.status !== 404) throw error
    }
  },

  async deleteDomain(domainId: string, userId: string) {
    const domain = await prisma.customDomain.findFirst({ where: { id: domainId, userId } })
    if (!domain) throw new DomainIntegrationError('Domain not found.', 404)
    await this.detachDomain(domain.domain)
    await prisma.customDomain.delete({ where: { id: domain.id } })
  },
}
