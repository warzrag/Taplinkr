import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSignedToken, passwordCookieName, verifySignedToken } from '@/lib/signed-token'

export async function GET(request: NextRequest, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  try {
    const { slug } = params
    
    // Récupérer le lien avec protection
    const link = await prisma.link.findUnique({
      where: { slug },
      select: {
        id: true,
        slug: true,
        directUrl: true,
        shieldEnabled: true,
        isUltraLink: true,
        shieldConfig: true,
        isActive: true,
        passwordProtection: { select: { id: true } },
      }
    })
    
    if (!link || !link.isActive || !link.directUrl) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 })
    }
    
    // Vérifier que le lien a une protection activée
    if (!link.shieldEnabled && !link.isUltraLink) {
      return NextResponse.json({ error: 'No protection enabled' }, { status: 400 })
    }

    if (link.passwordProtection) {
      const passwordToken = request.cookies.get(passwordCookieName(link.id))?.value
      if (!verifySignedToken(passwordToken, 'password-access', link.id)) {
        return NextResponse.json({ error: 'Password required' }, { status: 401 })
      }
    }

    let timer = 3000
    try {
      const parsed = link.shieldConfig ? JSON.parse(link.shieldConfig) : null
      timer = Math.min(Math.max(Number(parsed?.timer) || 3000, 1000), 10000)
    } catch {}

    const now = Date.now()
    const destinationToken = createSignedToken(
      'shield-destination',
      link.id,
      now + timer + 60_000,
      now + timer,
    )
    const { directUrl: _directUrl, passwordProtection: _passwordProtection, ...publicLink } = link

    return NextResponse.json({ ...publicLink, destinationToken })
  } catch (error) {
    console.error('Error fetching shield link:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
