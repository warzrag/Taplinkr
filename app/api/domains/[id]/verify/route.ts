import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'

import { authOptions } from '@/lib/auth'
import { DomainIntegrationError, domainManager } from '@/lib/domain-manager'

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = await context.params
    const domain = await domainManager.refreshDomain(id, session.user.id)
    let dnsRecords = []
    try { dnsRecords = domain.dnsRecords ? JSON.parse(domain.dnsRecords) : [] } catch {}
    return NextResponse.json({ domain: { ...domain, dnsRecords } })
  } catch (error) {
    if (error instanceof DomainIntegrationError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Custom-domain verification failed:', error)
    return NextResponse.json({ error: 'Unable to verify the domain.' }, { status: 500 })
  }
}
