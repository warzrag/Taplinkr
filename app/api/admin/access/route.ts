import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'

import { authOptions } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ canAccess: false }, { status: 401 })
  }

  const configuredAdminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(Boolean)
  const email = session.user.email?.toLowerCase()
  const canAccess = session.user.role === 'admin' || Boolean(email && configuredAdminEmails.includes(email))

  return NextResponse.json(
    { canAccess },
    { headers: { 'Cache-Control': 'private, no-store, max-age=0' } }
  )
}
