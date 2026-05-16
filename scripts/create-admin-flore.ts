import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const email = 'admin@taplinkr.com';
    const password = process.env.ADMIN_PASSWORD || ''; // Vous pouvez changer ce mot de passe
    const hashedPassword = await hash(password, 12);

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      // Mettre à jour l'utilisateur existant
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
          plan: 'premium'
        }
      });
      console.log('✅ Utilisateur admin mis à jour:', updatedUser.email);
    } else {
      // Créer un nouvel utilisateur admin
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name: 'Admin',
          username: 'admin',
          role: 'ADMIN',
          emailVerified: true,
          plan: 'premium'
        }
      });
      console.log('✅ Utilisateur admin créé:', newUser.email);
    }

    console.log('\n🔐 Informations de connexion:');
    console.log('Email:', email);
    console.log('Mot de passe:', password);
    console.log('\n📍 URL de connexion: http://localhost:3000/auth/signin');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
