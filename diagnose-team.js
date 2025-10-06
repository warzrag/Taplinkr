const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function diagnose() {
  console.log('🔍 DIAGNOSTIC PARTAGE DE LIEN\n')

  try {
    // 1. Vérifier l'utilisateur invité
    console.log('1️⃣ Utilisateur ivorraflorent1@gmail.com:')
    const user = await prisma.user.findUnique({
      where: { email: 'ivorraflorent1@gmail.com' },
      select: { id: true, email: true, teamId: true, teamRole: true }
    })

    if (!user) {
      console.log('   ❌ Utilisateur NON TROUVÉ\n')
    } else {
      console.log('   ✅ Utilisateur trouvé')
      console.log('   ID:', user.id)
      console.log('   TeamId:', user.teamId || 'NULL (PAS DANS UNE ÉQUIPE!)')
      console.log('   TeamRole:', user.teamRole || 'NULL')
      console.log('')
    }

    // 2. Vérifier le lien lolobpts
    console.log('2️⃣ Lien lolobpts:')
    const link = await prisma.link.findUnique({
      where: { slug: 'lolobpts' },
      select: {
        id: true,
        slug: true,
        title: true,
        teamShared: true,
        teamId: true,
        userId: true
      }
    })

    if (!link) {
      console.log('   ❌ Lien NON TROUVÉ\n')
    } else {
      console.log('   ✅ Lien trouvé')
      console.log('   ID:', link.id)
      console.log('   TeamShared:', link.teamShared)
      console.log('   TeamId:', link.teamId || 'NULL (PAS PARTAGÉ!)')
      console.log('   UserId (propriétaire):', link.userId)
      console.log('')
    }

    // 3. Vérifier les invitations
    console.log('3️⃣ Invitations pour ivorraflorent1@gmail.com:')
    const invitations = await prisma.teamInvitation.findMany({
      where: { email: 'ivorraflorent1@gmail.com' }
    })

    if (invitations.length === 0) {
      console.log('   ❌ Aucune invitation trouvée\n')
    } else {
      invitations.forEach((inv, i) => {
        console.log('   Invitation', i + 1 + ':')
        console.log('   Status:', inv.status)
        console.log('   TeamId:', inv.teamId)
        console.log('   Role:', inv.role)
        console.log('   Expire:', inv.expiresAt)
        console.log('')
      })
    }

    // 4. Vérifier toutes les équipes
    console.log('4️⃣ Équipes existantes:')
    const teams = await prisma.team.findMany({
      select: { id: true, name: true, ownerId: true }
    })

    teams.forEach((team, i) => {
      console.log('   Équipe', i + 1 + ':', team.name)
      console.log('   ID:', team.id)
      console.log('   OwnerId:', team.ownerId)
      console.log('')
    })

    // 5. Vérifier tous les membres de toutes les équipes
    console.log('5️⃣ Membres des équipes:')
    for (const team of teams) {
      const members = await prisma.user.findMany({
        where: { teamId: team.id },
        select: { id: true, email: true, teamRole: true }
      })
      console.log('   Équipe:', team.name)
      if (members.length === 0) {
        console.log('   ⚠️ Aucun membre')
      } else {
        members.forEach(m => {
          console.log('     -', m.email, '(', m.teamRole, ')')
        })
      }
      console.log('')
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

diagnose()
