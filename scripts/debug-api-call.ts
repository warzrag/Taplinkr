import { PrismaClient } from '@prisma/client'
import { getUserPermissions, checkPermission } from '../lib/permissions'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

async function debugApiCall() {
  try {
    console.log('🔍 Debug API Call - Reproduction exacte de l\'API')
    
    // Étape 1: Simulation récupération session
    console.log('\n📋 Étape 1: Session')
    const userId = 'cmddq4jcf0000c303064nzumn'
    console.log('✅ User ID:', userId)
    
    // Étape 2: Parsing body
    console.log('\n📋 Étape 2: Body')
    const body = { name: 'Test Team API Debug', description: 'Test description' }
    const { name, description } = body
    console.log('✅ Body parsed:', { name, description })
    
    if (!name) {
      console.log('❌ Nom requis')
      return
    }
    
    // Étape 3: Recherche utilisateur
    console.log('\n📋 Étape 3: Recherche utilisateur')
    console.log('Recherche utilisateur:', userId)
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })
    console.log('Utilisateur trouvé:', user ? { id: user.id, plan: user.plan, role: user.role } : 'null')
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      return
    }
    
    // Étape 4: Vérification permissions
    console.log('\n📋 Étape 4: Permissions')
    const permissions = getUserPermissions(user)
    console.log('Permissions:', permissions)
    
    const hasTeamAccess = checkPermission(permissions, 'hasTeamMembers')
    console.log('Accès équipe:', hasTeamAccess)
    
    if (!hasTeamAccess) {
      console.log('❌ Pas d\'accès Premium')
      return
    }
    
    // Étape 5: Vérification équipe existante
    console.log('\n📋 Étape 5: Équipe existante')
    const existingTeam = await prisma.team.findFirst({
      where: { ownerId: userId }
    })
    console.log('Équipe existante:', existingTeam ? 'OUI' : 'NON')
    
    if (existingTeam) {
      console.log('❌ Équipe déjà existante:', {
        id: existingTeam.id,
        name: existingTeam.name,
        slug: existingTeam.slug
      })
      return
    }
    
    // Étape 6: Création équipe
    console.log('\n📋 Étape 6: Création équipe')
    const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${nanoid(6)}`
    console.log('Création équipe avec:', { name, description, slug, ownerId: userId })
    
    const team = await prisma.team.create({
      data: {
        name,
        description,
        slug,
        ownerId: userId,
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
    
    console.log('✅ Équipe créée:', team.id)
    console.log('📊 Résultat final:', { 
      success: true, 
      team: { id: team.id, name: team.name, slug: team.slug } 
    })
    
  } catch (error) {
    console.error('❌ Erreur dans debug API:', error)
    if (error instanceof Error) {
      console.error('📝 Message:', error.message)
      console.error('📜 Stack:', error.stack)
    }
  } finally {
    await prisma.$disconnect()
  }
}

debugApiCall()