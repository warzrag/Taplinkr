import { NextRequest, NextResponse } from 'next/server'
import { passwordProtectionService } from '@/lib/password-protection'
import { createSignedToken, passwordCookieName } from '@/lib/signed-token'

export async function POST(request: NextRequest, props: { params: Promise<{ linkId: string }> }) {
  const params = await props.params;
  try {
    const { password } = await request.json()
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown'

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    const result = await passwordProtectionService.verifyPassword(
      params.linkId,
      password,
      ip.split(',')[0].trim()
    )

    if (result.success) {
      // Set a session cookie or token to remember verification
      const response = NextResponse.json({ success: true })
      const maxAge = 60 * 60 * 24
      const token = createSignedToken('password-access', params.linkId, Date.now() + maxAge * 1000)
      response.cookies.set(passwordCookieName(params.linkId), token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge,
      })
      return response
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        lockedUntil: result.lockedUntil
      }, { status: 401 })
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du mot de passe:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
