const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testDirectCreate() {
  try {
    // 1. Récupérer l'utilisateur test
    const user = await prisma.user.findUnique({
      where: { username: 'testuser' }
    });
    
    if (!user) {
      console.log('Utilisateur test non trouvé');
      return;
    }
    
    console.log('Utilisateur trouvé:', user.id);
    
    // 2. Créer un lien directement avec Prisma
    console.log('\nCréation d\'un lien directement...');
    
    const linkData = {
      slug: 'test-' + Date.now(),
      title: 'Test Direct Link',
      description: 'Test pour débugger',
      color: '#3b82f6',
      icon: null,
      coverImage: null,
      profileImage: null,
      fontFamily: null,
      borderRadius: null,
      backgroundColor: null,
      textColor: null,
      animation: null,
      order: 1,
      userId: user.id,
      isDirect: false,
      directUrl: null,
      shieldEnabled: false,
      isUltraLink: false,
      shieldConfig: null,
      isOnline: false,
      city: null,
      country: null,
      instagramUrl: null,
      tiktokUrl: null,
      twitterUrl: null,
      youtubeUrl: null
    };
    
    console.log('Données du lien:', linkData);
    
    const link = await prisma.link.create({
      data: linkData
    });
    
    console.log('\n✅ Lien créé avec succès:', {
      id: link.id,
      slug: link.slug,
      title: link.title
    });
    
    // 3. Créer des multi-liens
    const multiLink = await prisma.multiLink.create({
      data: {
        title: 'Google',
        url: 'https://google.com',
        description: 'Moteur de recherche',
        icon: null,
        iconImage: null,
        animation: null,
        order: 0,
        parentLinkId: link.id
      }
    });
    
    console.log('✅ Multi-lien créé:', multiLink.id);
    
  } catch (error) {
    console.error('\n❌ Erreur:', error);
    console.error('Code d\'erreur:', error.code);
    console.error('Meta:', error.meta);
  } finally {
    await prisma.$disconnect();
  }
}

testDirectCreate();