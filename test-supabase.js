// Script de test pour vérifier la connexion Supabase
const fetch = require('node-fetch');

async function testSupabase() {
  const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74';

  console.log('🔍 Test de connexion à Supabase...\n');

  try {
    // Test 1: Récupérer tous les liens
    console.log('📋 Test 1: Récupération de tous les liens...');
    const linksResponse = await fetch(
      `${supabaseUrl}/rest/v1/Link?select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    );

    if (linksResponse.ok) {
      const links = await linksResponse.json();
      console.log(`✅ ${links.length} liens trouvés dans la base`);
      
      if (links.length > 0) {
        console.log('\n📊 Détails des liens:');
        links.forEach((link, index) => {
          console.log(`\n  Lien ${index + 1}:`);
          console.log(`    - ID: ${link.id}`);
          console.log(`    - Titre: ${link.title}`);
          console.log(`    - Slug: ${link.slug}`);
          console.log(`    - UserId: ${link.userId}`);
          console.log(`    - Actif: ${link.isActive}`);
          console.log(`    - Clics: ${link.clicks}`);
        });
      }
    } else {
      console.log(`❌ Erreur: Status ${linksResponse.status}`);
      const error = await linksResponse.text();
      console.log('Détails:', error);
    }

    // Test 2: Récupérer tous les utilisateurs
    console.log('\n\n📋 Test 2: Récupération des utilisateurs...');
    const usersResponse = await fetch(
      `${supabaseUrl}/rest/v1/User?select=id,email,username`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    );

    if (usersResponse.ok) {
      const users = await usersResponse.json();
      console.log(`✅ ${users.length} utilisateurs trouvés`);
      
      if (users.length > 0) {
        console.log('\n👥 Utilisateurs:');
        users.forEach((user, index) => {
          console.log(`  ${index + 1}. ${user.email} (ID: ${user.id})`);
        });
      }
    } else {
      console.log(`❌ Erreur: Status ${usersResponse.status}`);
    }

    // Test 3: Vérifier les multilinks
    console.log('\n\n📋 Test 3: Récupération des MultiLinks...');
    const multiLinksResponse = await fetch(
      `${supabaseUrl}/rest/v1/MultiLink?select=*`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
        }
      }
    );

    if (multiLinksResponse.ok) {
      const multiLinks = await multiLinksResponse.json();
      console.log(`✅ ${multiLinks.length} multilinks trouvés`);
    } else {
      console.log(`❌ Erreur: Status ${multiLinksResponse.status}`);
    }

  } catch (error) {
    console.error('❌ Erreur de connexion:', error.message);
  }
}

testSupabase();