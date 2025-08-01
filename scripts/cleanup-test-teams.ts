import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupTestTeams() {
  try {
    console.log('🧹 Nettoyage des équipes de test')
    
    // Supprimer toutes les équipes appartenant à l'utilisateur test
    const deleted = await prisma.team.deleteMany({
      where: { ownerId: 'cmddq4jcf0000c303064nzumn' }
    })
    
    console.log('✅ Équipes supprimées:', deleted.count)
    
    // Vérifier qu'il n'y a plus d'équipes
    const remaining = await prisma.team.findMany({
      where: { ownerId: 'cmddq4jcf0000c303064nzumn' }
    })
    
    console.log('📊 Équipes restantes:', remaining.length)
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupTestTeams()