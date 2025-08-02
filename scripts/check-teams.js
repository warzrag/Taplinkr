require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkTeams() {
  try {
    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        subscription: true
      }
    })

    console.log('\nUtilisateurs:')
    users.forEach(user => {
      console.log(`- ${user.email} (${user.name || 'Sans nom'}) - ${user.subscription || 'free'}`)
    })

    // Récupérer toutes les équipes
    const teams = await prisma.team.findMany({
      include: {
        owner: {
          select: {
            email: true,
            name: true
          }
        },
        members: {
          select: {
            email: true,
            name: true,
            teamRole: true
          }
        },
        invitations: {
          where: {
            status: 'pending'
          }
        }
      }
    })

    console.log('\n=== ÉQUIPES ===')
    if (teams.length === 0) {
      console.log('Aucune équipe trouvée dans la base de données')
    } else {
      teams.forEach(team => {
        console.log(`\nÉquipe: "${team.name}" (${team.slug})`)
        console.log(`Propriétaire: ${team.owner.email}`)
        console.log(`Membres: ${team.members.length}`)
        console.log(`Invitations en attente: ${team.invitations.length}`)
        console.log(`Max membres: ${team.maxMembers}`)
        
        if (team.members.length > 0) {
          console.log('Membres:')
          team.members.forEach(member => {
            console.log(`  - ${member.email} (${member.teamRole})`)
          })
        }
      })
    }

    // Vérifier les invitations
    const invitations = await prisma.teamInvitation.findMany({
      include: {
        team: true,
        invitedBy: true
      }
    })

    console.log('\n=== INVITATIONS ===')
    if (invitations.length === 0) {
      console.log('Aucune invitation trouvée')
    } else {
      invitations.forEach(inv => {
        console.log(`\n${inv.email} invité à "${inv.team.name}"`)
        console.log(`Rôle: ${inv.role}`)
        console.log(`Statut: ${inv.status}`)
        console.log(`Invité par: ${inv.invitedBy.email}`)
        console.log(`Expire: ${inv.expiresAt}`)
      })
    }

  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkTeams()