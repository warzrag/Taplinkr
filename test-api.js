const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. Se connecter
    console.log('1. Connexion...');
    const loginResponse = await fetch(`${baseURL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: 'test',
        password: 'test123',
        redirect: 'false',
        callbackUrl: '/',
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies reçus:', cookies ? 'Oui' : 'Non');
    
    // 2. Créer un lien
    console.log('\n2. Création d\'un lien...');
    const linkData = {
      title: "Test Link",
      description: "Test description",
      color: "#3b82f6",
      multiLinks: [
        {
          title: "Google",
          url: "https://google.com"
        }
      ]
    };
    
    const createResponse = await fetch(`${baseURL}/api/links`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies || ''
      },
      body: JSON.stringify(linkData)
    });
    
    const responseText = await createResponse.text();
    console.log('Status:', createResponse.status);
    console.log('Response:', responseText);
    
    if (createResponse.status === 500) {
      console.log('\nERREUR 500 détectée. Vérification des logs du serveur...');
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testAPI();