import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { passwordCookieName, verifySignedToken } from '@/lib/signed-token'

export async function POST(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { token } = await request.json()
    const link = await prisma.link.findUnique({
      where: { slug: params.slug },
      select: {
        id: true,
        directUrl: true,
        isActive: true,
        shieldEnabled: true,
        isUltraLink: true,
        passwordProtection: { select: { id: true } },
      },
    })

    if (!link?.isActive || !link.directUrl || (!link.shieldEnabled && !link.isUltraLink)) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    if (!verifySignedToken(token, 'shield-destination', link.id, { enforceNotBefore: true })) {
      return NextResponse.json({ error: 'Verification incomplete' }, { status: 403 })
    }
    if (link.passwordProtection) {
      const passwordToken = request.cookies.get(passwordCookieName(link.id))?.value
      if (!verifySignedToken(passwordToken, 'password-access', link.id)) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 })
      }
    }

    return NextResponse.json({ url: link.directUrl })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
