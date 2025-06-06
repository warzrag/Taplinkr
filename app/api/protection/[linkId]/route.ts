import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { passwordProtectionService } from '@/lib/password-protection'

export async function POST(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { password, hint } = await request.json()

    if (!password) {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 })
    }

    // Verify link ownership
    const link = await prisma.link.findUnique({
      where: { 
        id: params.linkId,
        userId: session.user.id
      }
    })

    if (!link) {
      return NextResponse.json({ error: 'Lien non trouvé' }, { status: 404 })
    }

    const protection = await passwordProtectionService.setPassword(
      params.linkId,
      session.user.id,
      password,
      hint
    )

    return NextResponse.json({ 
      success: true,
      hint: protection.hint 
    })
  } catch (error) {
    console.error('Erreur lors de la configuration de la protection:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const success = await passwordProtectionService.removePassword(
      params.linkId,
      session.user.id
    )

    if (!success) {
      return NextResponse.json({ error: 'Protection non trouvée' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erreur lors de la suppression de la protection:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { linkId: string } }
) {
  try {
    const protection = await passwordProtectionService.getProtectionInfo(params.linkId)
    
    return NextResponse.json({
      isProtected: !!protection,
      hint: protection?.hint,
      isLocked: protection?.lockedUntil ? protection.lockedUntil > new Date() : false,
      lockedUntil: protection?.lockedUntil
    })
  } catch (error) {
    console.error('Erreur lors de la récupération de la protection:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}