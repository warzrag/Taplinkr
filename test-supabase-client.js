// Test du client Supabase JS
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://dkwgorynhgnmldzbhhrb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRrd2dvcnluaGdubWxkemJoaHJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjcyMTE4ODAsImV4cCI6MjA0Mjc4Nzg4MH0.Ev-KpsHZ2rl-rvMoVP33N2yyw3O3tMhqlPNmT58wz74'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function test() {
  console.log('🔍 Test du client Supabase JS...\n')

  // Test 1: Récupérer les liens
  console.log('📋 Test 1: Récupération des liens...')
  const { data: links, error: linksError } = await supabase
    .from('Link')
    .select('*')
  
  if (linksError) {
    console.error('❌ Erreur:', linksError)
  } else {
    console.log(`✅ ${links.length} liens trouvés`)
    if (links.length > 0) {
      console.log('Premier lien:', {
        id: links[0].id,
        title: links[0].title,
        slug: links[0].slug,
        userId: links[0].userId
      })
    }
  }

  // Test 2: Récupérer les utilisateurs
  console.log('\n📋 Test 2: Récupération des utilisateurs...')
  const { data: users, error: usersError } = await supabase
    .from('User')
    .select('id, email, username')
  
  if (usersError) {
    console.error('❌ Erreur:', usersError)
  } else {
    console.log(`✅ ${users.length} utilisateurs trouvés`)
    if (users.length > 0) {
      console.log('Utilisateurs:')
      users.forEach(u => console.log(`  - ${u.email} (${u.id})`))
    }
  }
}

test()