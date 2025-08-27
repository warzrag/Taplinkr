import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  datasourceUrl: "postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:5432/postgres"
})

async function fixAnimationColumn() {
  try {
    console.log('🔧 Ajout de la colonne animation si elle n\'existe pas...')
    
    // Ajouter la colonne animation à la table links si elle n'existe pas
    await prisma.$executeRawUnsafe(`
      ALTER TABLE links 
      ADD COLUMN IF NOT EXISTS animation VARCHAR(255);
    `)
    console.log('✅ Colonne animation ajoutée à la table links')
    
    // Ajouter la colonne animation à la table multi_links si elle n'existe pas
    await prisma.$executeRawUnsafe(`
      ALTER TABLE multi_links 
      ADD COLUMN IF NOT EXISTS animation VARCHAR(255);
    `)
    console.log('✅ Colonne animation ajoutée à la table multi_links')
    
    // Vérifier que les colonnes existent
    const linksColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'links' AND column_name = 'animation';
    ` as any[]
    
    const multiLinksColumns = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'multi_links' AND column_name = 'animation';
    ` as any[]
    
    console.log('\n📊 Vérification:')
    console.log(`   Table links: colonne animation ${linksColumns.length > 0 ? '✅ existe' : '❌ manquante'}`)
    console.log(`   Table multi_links: colonne animation ${multiLinksColumns.length > 0 ? '✅ existe' : '❌ manquante'}`)
    
    console.log('\n✅ Correction terminée!')
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixAnimationColumn()