const bcrypt = require('bcryptjs');

async function testPassword() {
  const password = 'Admin123!';
  
  // Générer un nouveau hash
  const newHash = await bcrypt.hash(password, 12);
  console.log('Nouveau hash généré:', newHash);
  
  // Tester avec l'ancien hash
  const oldHash = '$2a$12$KIGhxdhfqEJG2gDQP3J4AeZxQ5iVdVxPQWEgchxvZvE6CyvWF1bxK';
  const isValidOld = await bcrypt.compare(password, oldHash);
  console.log('L\'ancien hash est valide?', isValidOld);
  
  // Tester avec le nouveau hash
  const isValidNew = await bcrypt.compare(password, newHash);
  console.log('Le nouveau hash est valide?', isValidNew);
}

testPassword();