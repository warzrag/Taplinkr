const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password = 'Admin123!';
  
  console.log('=== GÉNÉRATION DE TOUS LES HASHS POSSIBLES ===\n');
  console.log('Mot de passe:', password);
  console.log('\n--- Hashs avec différents salt rounds ---\n');
  
  // Générer avec différents salt rounds
  for (let rounds of [10, 11, 12, 13]) {
    const hash = await bcrypt.hash(password, rounds);
    console.log(`Salt rounds ${rounds}:`);
    console.log(hash);
    
    // Vérifier que le hash fonctionne
    const isValid = await bcrypt.compare(password, hash);
    console.log(`Validation: ${isValid ? '✅' : '❌'}\n`);
  }
  
  // Générer un hash par défaut recommandé
  console.log('--- Hash recommandé (rounds=10) ---\n');
  const recommendedHash = await bcrypt.hash(password, 10);
  console.log('Hash à utiliser:');
  console.log(recommendedHash);
  
  // Test avec un mot de passe simple pour backup
  console.log('\n--- Hash pour mot de passe simple ---\n');
  const simplePassword = 'admin123';
  const simpleHash = await bcrypt.hash(simplePassword, 10);
  console.log('Mot de passe:', simplePassword);
  console.log('Hash:', simpleHash);
}

generateHashes();