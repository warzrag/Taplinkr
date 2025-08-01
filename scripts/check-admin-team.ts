import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAdminTeam() {
  try {
    console.log('🔍 Vérification de l\'équipe admin...\n')
    
    // Trouver l'utilisateur admin
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@linktracker.com' },
      include: {
        ownedTeam: {
          include: {
            members: true,
            invitations: {
              where: { status: 'pending' }
            }
          }
        },
        team: true
      }
    })
    
    if (!admin) {
      console.log('❌ Admin non trouvé')
      return
    }
    
    console.log('👤 Compte Admin:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:', admin.email)
    console.log('🆔 ID:', admin.id)
    console.log('🛡️ Rôle:', admin.role)
    console.log('📦 Plan:', admin.plan)
    console.log('🏷️ Username:', admin.username)
    
    if (admin.ownedTeam) {
      console.log('\n🏢 Équipe possédée:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📝 Nom:', admin.ownedTeam.name)
      console.log('🔖 Description:', admin.ownedTeam.description || 'Aucune')
      console.log('🔗 Slug:', admin.ownedTeam.slug)
      console.log('👥 Limite membres:', admin.ownedTeam.maxMembers)
      console.log('👤 Membres actuels:', admin.ownedTeam.members.length + 1, '(incluant le propriétaire)')
      console.log('📨 Invitations en attente:', admin.ownedTeam.invitations.length)
      
      if (admin.ownedTeam.members.length > 0) {
        console.log('\n👥 Membres de l\'équipe:')
        admin.ownedTeam.members.forEach((member, index) => {
          console.log(`  ${index + 1}. ${member.email} (${member.teamRole})`)
        })
      }
    } else {
      console.log('\n⚠️ L\'admin ne possède pas d\'équipe')
    }
    
    if (admin.team && admin.team.id !== admin.ownedTeam?.id) {
      console.log('\n🤝 Membre d\'une autre équipe:')
      console.log('  ID:', admin.team.id)
      console.log('  Rôle:', admin.teamRole)
    }
    
    console.log('\n✅ Permissions admin:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('✓ Accès à toutes les fonctionnalités')
    console.log('✓ Pas de limites sur les liens, pages ou dossiers')
    console.log('✓ Gestion d\'équipe avec 100 membres max')
    console.log('✓ Accès au panneau d\'administration')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAdminTeam()