import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const prisma = new PrismaClient();

async function testAuth() {
  console.log('🔐 TEST D\'AUTHENTIFICATION COMPLET\n');
  console.log('='.repeat(50));
  
  const testAccounts = [
    { email: 'admin@taplinkr.com', password: 'Admin123!' },
    { email: 'florentivo95270@gmail.com', password: 'Admin123!' }
  ];
  
  for (const account of testAccounts) {
    console.log(`\n📧 Test du compte: ${account.email}`);
    
    try {
      // 1. Récupérer l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email: account.email }
      });
      
      if (!user) {
        console.log('   ❌ Utilisateur introuvable dans la base de données');
        continue;
      }
      
      console.log('   ✅ Utilisateur trouvé');
      console.log(`   - Role: ${user.role}`);
      console.log(`   - Email vérifié: ${user.emailVerified ? '✅' : '❌'}`);
      
      // 2. Vérifier le mot de passe
      if (!user.password) {
        console.log('   ❌ L\'utilisateur n\'a pas de mot de passe');
        continue;
      }
      
      const isPasswordValid = await bcrypt.compare(account.password, user.password);
      console.log(`   - Mot de passe valide: ${isPasswordValid ? '✅' : '❌'}`);
      
      if (!isPasswordValid) {
        console.log('   💡 Le hash du mot de passe ne correspond pas');
        console.log(`   Hash actuel: ${user.password.substring(0, 20)}...`);
        
        // Générer un nouveau hash pour comparaison
        const newHash = await bcrypt.hash(account.password, 10);
        console.log(`   Nouveau hash suggéré: ${newHash.substring(0, 20)}...`);
      }
      
      // 3. Vérifier les conditions d'authentification
      if (user.emailVerified && isPasswordValid) {
        console.log('   ✅ AUTHENTIFICATION RÉUSSIE !');
      } else {
        console.log('   ❌ AUTHENTIFICATION ÉCHOUÉE');
        if (!user.emailVerified) {
          console.log('      - Email non vérifié');
        }
        if (!isPasswordValid) {
          console.log('      - Mot de passe incorrect');
        }
      }
      
    } catch (error: any) {
      console.log('   ❌ Erreur:', error.message);
    }
  }
  
  console.log('\n' + '='.repeat(50));
  console.log('\n💡 VÉRIFICATION DE LA CONFIGURATION NEXTAUTH:');
  console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL || '❌ Non défini');
  console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Défini' : '❌ Non défini');
  
  await prisma.$disconnect();
}

testAuth().catch(console.error);