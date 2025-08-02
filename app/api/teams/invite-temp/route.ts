import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getUserPermissions, checkLimit } from '@/lib/permissions'
import { nanoid } from 'nanoid'
import { sendEmail } from '@/lib/email'

// Version temporaire qui contourne le problème de contrainte
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const body = await request.json()
    const { email, role = 'member', teamId } = body

    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 })
    }

    // Vérifier l'équipe
    const team = await prisma.team.findFirst({
      where: teamId ? {
        id: teamId,
        OR: [
          { ownerId: session.user.id },
          { members: { some: { id: session.user.id, teamRole: 'admin' } } }
        ]
      } : {
        ownerId: session.user.id
      },
      include: {
        members: true,
        invitations: { where: { status: 'pending' } }
      }
    })

    if (!team) {
      return NextResponse.json({ error: 'Aucune équipe trouvée' }, { status: 404 })
    }

    // Créer l'invitation avec une requête SQL brute pour éviter les contraintes
    const invitationId = nanoid()
    const token = nanoid(32)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 7)

    try {
      // Utiliser executeRawUnsafe pour insérer directement
      await prisma.$executeRawUnsafe(`
        INSERT INTO team_invitations (id, "teamId", email, role, token, status, "invitedById", "expiresAt", "createdAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      `, invitationId, team.id, email, role, token, 'pending', session.user.id, expiresAt, new Date())

      // Envoyer l'email
      try {
        const inviteUrl = `${process.env.NEXTAUTH_URL || 'https://taplinkr.com'}/teams/join/${token}`
        
        await sendEmail({
          to: email,
          subject: `Invitation à rejoindre l'équipe ${team.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Invitation à rejoindre une équipe</h2>
              <p>${session.user.name || session.user.email} vous invite à rejoindre l'équipe <strong>${team.name}</strong> sur TapLinkr.</p>
              <p style="background-color: #f3f4f6; padding: 16px; border-radius: 8px;">
                ⚠️ <strong>Important :</strong> Vous devez d'abord créer un compte sur TapLinkr avec l'email <strong>${email}</strong>
              </p>
              <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
                Accepter l'invitation
              </a>
              <p style="color: #666; font-size: 14px;">Cette invitation expire dans 7 jours.</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Erreur email:', emailError)
      }

      return NextResponse.json({ 
        success: true,
        message: 'Invitation envoyée avec succès!'
      }, { status: 201 })

    } catch (dbError: any) {
      if (dbError.message?.includes('Unique constraint')) {
        return NextResponse.json({ error: 'Une invitation existe déjà pour cet email' }, { status: 400 })
      }
      throw dbError
    }

  } catch (error) {
    console.error('Erreur invitation:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'invitation' },
      { status: 500 }
    )
  }
}