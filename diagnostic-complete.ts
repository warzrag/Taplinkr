import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

console.log('🔍 DIAGNOSTIC COMPLET DU SYSTÈME\n');
console.log('='.repeat(50));

// 1. Vérifier les variables d'environnement
console.log('\n📋 VARIABLES D\'ENVIRONNEMENT:');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Définie' : '❌ Manquante');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Définie' : '❌ Manquante');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Manquante');

if (!process.env.DATABASE_URL) {
  console.log('\n❌ ERREUR: DATABASE_URL n\'est pas définie!');
  console.log('Créez un fichier .env.local avec votre DATABASE_URL Supabase');
  process.exit(1);
}

const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

async function testConnection() {
  console.log('\n📊 TEST DE CONNEXION À LA BASE DE DONNÉES:');
  
  try {
    // Tester la connexion
    await prisma.$connect();
    console.log('✅ Connexion à la base de données réussie!');
    
    // Compter les utilisateurs
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre total d'utilisateurs: ${userCount}`);
    
    // Lister tous les utilisateurs
    console.log('\n👥 LISTE DES UTILISATEURS:');
    const users = await prisma.user.findMany({
      select: {
        email: true,
        username: true,
        role: true,
        emailVerified: true,
        password: true
      }
    });
    
    for (const user of users) {
      console.log(`\n📧 Email: ${user.email}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Email vérifié: ${user.emailVerified ? '✅' : '❌'}`);
      console.log(`   A un mot de passe: ${user.password ? '✅' : '❌'}`);
    }
    
    // Tester spécifiquement le compte admin
    console.log('\n🔐 TEST DU COMPTE ADMIN:');
    const adminEmail = 'admin@taplinkr.com';
    const adminPassword = 'Admin123!';
    
    const admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      console.log('❌ Compte admin introuvable!');
      console.log('Créez-le avec le script SQL dans Supabase');
    } else {
      console.log('✅ Compte admin trouvé!');
      console.log(`   ID: ${admin.id}`);
      console.log(`   Username: ${admin.username}`);
      console.log(`   Role: ${admin.role}`);
      
      // Tester le mot de passe
      if (admin.password) {
        console.log('\n🔑 TEST DU MOT DE PASSE:');
        
        // Tester avec différentes méthodes
        const tests = [
          { password: 'Admin123!', name: 'Admin123!' },
          { password: 'admin123', name: 'admin123' },
        ];
        
        for (const test of tests) {
          const isValid = await bcrypt.compare(test.password, admin.password);
          console.log(`   ${test.name}: ${isValid ? '✅ Valide' : '❌ Invalide'}`);
        }
        
        // Afficher le hash actuel
        console.log(`\n   Hash actuel: ${admin.password.substring(0, 30)}...`);
        
        // Générer un nouveau hash correct
        console.log('\n💡 NOUVEAU HASH RECOMMANDÉ:');
        const newHash = await bcrypt.hash('Admin123!', 10);
        console.log(`   ${newHash}`);
        console.log('\n   Utilisez ce hash dans votre script SQL si nécessaire');
      } else {
        console.log('❌ Le compte admin n\'a pas de mot de passe!');
      }
    }
    
    // Test de création d'un utilisateur de test
    console.log('\n🧪 TEST DE CRÉATION D\'UTILISATEUR:');
    try {
      const testEmail = `test${Date.now()}@example.com`;
      const testPassword = await bcrypt.hash('test123', 10);
      
      const testUser = await prisma.user.create({
        data: {
          email: testEmail,
          username: `test${Date.now()}`,
          password: testPassword,
          emailVerified: true,
          role: 'user',
          plan: 'free'
        }
      });
      
      console.log('✅ Création d\'utilisateur réussie!');
      console.log(`   Email: ${testUser.email}`);
      
      // Nettoyer
      await prisma.user.delete({
        where: { id: testUser.id }
      });
      console.log('✅ Nettoyage effectué');
      
    } catch (error: any) {
      console.log('❌ Erreur lors de la création:', error.message);
    }
    
  } catch (error: any) {
    console.error('\n❌ ERREUR DE CONNEXION:', error.message);
    console.log('\n💡 SOLUTIONS POSSIBLES:');
    console.log('1. Vérifiez que votre projet Supabase est bien restauré');
    console.log('2. Vérifiez votre DATABASE_URL dans .env.local');
    console.log('3. Vérifiez que les tables existent dans Supabase');
  } finally {
    await prisma.$disconnect();
  }
}

// Exécuter le diagnostic
testConnection().then(() => {
  console.log('\n✅ DIAGNOSTIC TERMINÉ');
}).catch((error) => {
  console.error('\n❌ ERREUR FATALE:', error);
  process.exit(1);
});