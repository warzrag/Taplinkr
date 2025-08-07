const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        username: 'testuser',
        password: hashedPassword,
        name: 'Test User',
        emailVerified: true
      }
    });
    
    console.log('Utilisateur test créé avec succès:', {
      id: user.id,
      email: user.email,
      username: user.username
    });
    
  } catch (error) {
    if (error.code === 'P2002') {
      console.log('L\'utilisateur test existe déjà');
    } else {
      console.error('Erreur:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();