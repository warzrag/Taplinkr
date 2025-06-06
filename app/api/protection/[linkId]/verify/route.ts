import { NextRequest, NextResponse } from 'next/server'
import { passwordProtectionService } from '@/lib/password-protection'

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
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
      response.cookies.set(`verified_${params.linkId}`, 'true', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 // 24 hours
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