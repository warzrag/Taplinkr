import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugLinks() {
  try {
    // Trouver tous les liens
    const links = await prisma.link.findMany({
      include: {
        multiLinks: true,
        user: {
          select: {
            email: true,
            username: true
          }
        }
      }
    })

    console.log('\n=== LIENS DANS LA BASE DE DONNÉES ===\n')
    
    if (links.length === 0) {
      console.log('Aucun lien trouvé dans la base de données.')
      return
    }

    links.forEach((link, index) => {
      console.log(`\nLien ${index + 1}:`)
      console.log(`  Titre: ${link.title}`)
      console.log(`  Slug: ${link.slug}`)
      console.log(`  Actif: ${link.isActive ? '✅ OUI' : '❌ NON'}`)
      console.log(`  URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/redirect/${link.slug}`)
      console.log(`  Propriétaire: ${link.user.email} (@${link.user.username})`)
      console.log(`  MultiLinks: ${link.multiLinks.length} destination(s)`)
      
      if (link.multiLinks.length > 0) {
        link.multiLinks.forEach((ml, i) => {
          console.log(`    ${i + 1}. ${ml.title} -> ${ml.url}`)
        })
      }
    })

    console.log('\n=== RÉSUMÉ ===')
    console.log(`Total: ${links.length} lien(s)`)
    console.log(`Actifs: ${links.filter(l => l.isActive).length}`)
    console.log(`Inactifs: ${links.filter(l => !l.isActive).length}`)
    
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugLinks()