const { Client } = require('pg');

// Configuration exacte de Vercel
const connectionString = 'postgresql://postgres.dkwgorynhgnmldzbhhrb:FlO1998florent1998@aws-0-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true';

const client = new Client({
  connectionString: connectionString,
});

async function testConnection() {
  try {
    console.log('🔌 Test de connexion à Supabase...\n');
    console.log('URL:', connectionString.replace(/:[^:@]+@/, ':****@'));
    
    await client.connect();
    console.log('✅ Connexion réussie!');
    
    const res = await client.query('SELECT COUNT(*) FROM "User"');
    console.log(`📊 Nombre d'utilisateurs: ${res.rows[0].count}`);
    
    const users = await client.query('SELECT email, role FROM "User" LIMIT 5');
    console.log('\n👥 Utilisateurs:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.role})`);
    });
    
  } catch (err) {
    console.error('❌ Erreur de connexion:', err.message);
    console.log('\n💡 Vérifiez:');
    console.log('1. Que votre projet Supabase est actif');
    console.log('2. Le mot de passe dans DATABASE_URL');
    console.log('3. Le mode de pooling (Session vs Transaction)');
  } finally {
    await client.end();
  }
}

testConnection();