const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createNewUser() {
  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Flore123!', 10);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        email: 'flore@taplinkr.com',
        username: 'flore',
        password: hashedPassword,
        name: 'Flore',
        emailVerified: true,
        role: 'user',
        plan: 'free'
      }
    });

    console.log('✅ Utilisateur créé avec succès !');
    console.log('================================');
    console.log('📧 Email:', user.email);
    console.log('🔑 Mot de passe: Flore123!');
    console.log('👤 Username:', user.username);
    console.log('================================');

  } catch (error) {
    if (error.code === 'P2002') {
      console.log('⚠️ Cet utilisateur existe déjà');
      console.log('Essayez de vous connecter avec:');
      console.log('📧 Email: flore@taplinkr.com');
      console.log('🔑 Mot de passe: Flore123!');
    } else {
      console.error('Erreur:', error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

createNewUser();