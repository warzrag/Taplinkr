import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔧 RÉINITIALISATION DES MOTS DE PASSE ADMIN\n');
    
    // 1. Réinitialiser le mot de passe de florentivo95270@gmail.com
    const florentEmail = 'florentivo95270@gmail.com';
    const newPassword = 'Admin123!';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const updatedFlorent = await prisma.user.update({
      where: { email: florentEmail },
      data: { 
        password: hashedPassword,
        role: 'ADMIN' // S'assurer qu'il reste admin
      }
    });
    
    console.log('✅ Mot de passe réinitialisé pour:', florentEmail);
    console.log('   Nouveau mot de passe:', newPassword);
    
    // 2. Créer ou mettre à jour admin@taplinkr.com
    const adminEmail = 'admin@taplinkr.com';
    
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (existingAdmin) {
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true
        }
      });
      console.log('\n✅ Mot de passe mis à jour pour:', adminEmail);
    } else {
      // Générer un username unique
      let username = 'admin';
      let counter = 1;
      while (await prisma.user.findUnique({ where: { username } })) {
        username = `admin${counter}`;
        counter++;
      }
      
      await prisma.user.create({
        data: {
          email: adminEmail,
          username: username,
          password: hashedPassword,
          name: 'Administrateur',
          role: 'ADMIN',
          plan: 'premium',
          emailVerified: true
        }
      });
      console.log('\n✅ Nouveau compte créé:', adminEmail);
    }
    
    console.log('   Mot de passe:', newPassword);
    
    console.log('\n📋 RÉCAPITULATIF - VOUS POUVEZ VOUS CONNECTER AVEC :');
    console.log('===============================================');
    console.log('\nCompte 1:');
    console.log('  Email: florentivo95270@gmail.com');
    console.log('  Mot de passe: Admin123!');
    console.log('\nCompte 2:');
    console.log('  Email: admin@taplinkr.com');
    console.log('  Mot de passe: Admin123!');
    console.log('\nURL: https://www.taplinkr.com/auth/signin');
    console.log('===============================================');
    
  } catch (error: any) {
    console.error('❌ Erreur:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();