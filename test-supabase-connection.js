const { createClient } = require('@supabase/supabase-js');

// Configuration Supabase
const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74';

// Créer le client Supabase
const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔄 Test de connexion à Supabase...\n');
  
  try {
    // Test 1: Vérifier la connexion
    const { data: tables, error: tablesError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (tablesError) {
      console.error('❌ Erreur de connexion:', tablesError);
      return;
    }
    
    console.log('✅ Connexion à Supabase réussie!');
    console.log(`📊 Nombre d'utilisateurs dans la base: ${tables || 0}\n`);
    
    // Test 2: Lister quelques utilisateurs
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, username, role, plan')
      .limit(5);
    
    if (usersError) {
      console.error('❌ Erreur lors de la récupération des utilisateurs:', usersError);
      return;
    }
    
    if (users && users.length > 0) {
      console.log('👥 Utilisateurs existants:');
      users.forEach(user => {
        console.log(`   - ${user.username} (${user.email}) - ${user.role} [${user.plan}]`);
      });
    } else {
      console.log('ℹ️  Aucun utilisateur trouvé dans la base');
    }
    
    // Test 3: Vérifier les tables
    console.log('\n📋 Tables disponibles:');
    const tables_list = ['users', 'links', 'clicks', 'folders', 'analytics_events'];
    
    for (const table of tables_list) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      console.log(`   - ${table}: ${count || 0} enregistrements`);
    }
    
    console.log('\n✅ Tous les tests sont passés avec succès!');
    console.log('🚀 Vous pouvez maintenant lancer: npm run dev');
    
  } catch (error) {
    console.error('❌ Erreur générale:', error);
  }
}

// Exécuter le test
testConnection();