import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

import LinkPage, { generateMetadata as generateLinkMetadata } from '@/app/[slug]/page'
import { prisma } from '@/lib/prisma'

type Props = { params: Promise<{ domain: string; path?: string[] }> }

function normalizeHost(value: string) {
  return value.split(',')[0].trim().toLowerCase().replace(/:\d+$/, '').replace(/\.$/, '')
}

async function resolveDomain(rawDomain: string) {
  const domain = normalizeHost(decodeURIComponent(rawDomain))
  const requestHeaders = await headers()
  const requestHost = normalizeHost(requestHeaders.get('x-forwarded-host') || requestHeaders.get('host') || '')

  // This route is an internal rewrite target. It must never expose another
  // customer's page when visited directly through taplinkr.com.
  if (!requestHost || requestHost !== domain) return null
  return prisma.customDomain.findUnique({ where: { domain } })
}

export default async function CustomDomainPage({ params }: Props) {
  const { domain, path } = await params
  if (path?.length) notFound()
  const customDomain = await resolveDomain(domain)
  if (!customDomain?.verified || !customDomain.sslEnabled || !customDomain.redirectTo) notFound()
  return LinkPage({ params: Promise.resolve({ slug: customDomain.redirectTo }) })
}

export async function generateMetadata({ params }: Props) {
  const { domain } = await params
  const customDomain = await resolveDomain(domain)
  if (!customDomain?.verified || !customDomain.redirectTo) return { title: 'Page not found' }
  return generateLinkMetadata({ params: Promise.resolve({ slug: customDomain.redirectTo }) })
}

export const dynamic = 'force-dynamic'
