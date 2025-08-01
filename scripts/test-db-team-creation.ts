import { PrismaClient } from '@prisma/client'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function testDbTeamCreation() {
  try {
    console.log('🚀 Test création équipe direct en DB')
    
    // Récupérer l'utilisateur test
    const user = await prisma.user.findUnique({
      where: { id: 'cmddq4jcf0000c303064nzumn' }
    })
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }
    
    console.log('👤 Utilisateur:', { id: user.id, email: user.email, plan: user.plan })
    
    // Vérifier équipe existante
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: user.id }
    })
    
    if (existingTeam) {
      console.log('⚠️ Équipe existante trouvée:', existingTeam)
      // Supprimer pour le test
      await prisma.team.delete({
        where: { id: existingTeam.id }
      })
      console.log('🗑️ Équipe supprimée pour le test')
    }
    
    // Créer l'équipe
    const name = 'Test Team DB'
    const description = 'Test description'
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${nanoid(6)}`
    
    console.log('📝 Données création:', { name, description, slug, ownerId: user.id })
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        slug,
        ownerId: user.id,
      },
      include: {
        owner: {
          select: { id: true, name: true, email: true, image: true }
        },
        members: {
          select: { id: true, name: true, email: true, image: true, teamRole: true }
        }
      }
    })
    
    console.log('✅ Équipe créée avec succès:', {
      id: team.id,
      name: team.name,
      slug: team.slug,
      ownerId: team.ownerId
    })
    
  } catch (error) {
    console.error('❌ Erreur lors de la création:', error)
    if (error instanceof Error) {
      console.error('📝 Message:', error.message)
      console.error('📜 Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

testDbTeamCreation()