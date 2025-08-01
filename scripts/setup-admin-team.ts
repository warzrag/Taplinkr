import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function setupAdminTeam() {
  try {
    console.log('🔧 Configuration de l\'équipe admin...')
    
    // Trouver l'utilisateur admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@linktracker.com' }
    })
    
    if (!admin) {
      console.log('❌ Admin non trouvé')
      return
    }
    
    console.log('👤 Admin trouvé:', { 
      id: admin.id, 
      email: admin.email, 
      role: admin.role,
      plan: admin.plan 
    })
    
    // Vérifier s'il a déjà une équipe
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: admin.id }
    })
    
    if (existingTeam) {
      console.log('⚠️ L\'admin a déjà une équipe:', existingTeam.name)
      // Mettre à jour la limite de membres
      const updatedTeam = await prisma.team.update({
        where: { id: existingTeam.id },
        data: {
          maxMembers: 100 // Limite élevée pour l'admin
        }
      })
      console.log('✅ Limite de membres mise à jour:', updatedTeam.maxMembers)
    } else {
      // Créer une équipe pour l'admin
      const team = await prisma.team.create({
        data: {
          name: 'TapLinkr Admin Team',
          description: 'Équipe d\'administration de TapLinkr',
          slug: `admin-team-${nanoid(6)}`,
          ownerId: admin.id,
          maxMembers: 100 // Limite élevée pour l'admin
        }
      })
      
      console.log('✅ Équipe admin créée:', {
        id: team.id,
        name: team.name,
        slug: team.slug,
        maxMembers: team.maxMembers
      })
      
      // Mettre à jour l'utilisateur admin
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          teamId: team.id,
          teamRole: 'owner'
        }
      })
      
      console.log('✅ Admin associé à l\'équipe')
    }
    
    // S'assurer que l'admin a le plan premium (même si les permissions admin override)
    if (admin.plan !== 'premium') {
      await prisma.user.update({
        where: { id: admin.id },
        data: {
          plan: 'premium',
          planExpiresAt: null // Pas d'expiration
        }
      })
      console.log('✅ Plan premium activé pour l\'admin')
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

setupAdminTeam()