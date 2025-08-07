const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. Obtenir le CSRF token
    console.log('1. Obtention du CSRF token...');
    const csrfResponse = await fetch(`${baseURL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log('CSRF Token obtenu');
    
    // 2. Se connecter avec email (pas username)
    console.log('\n2. Connexion avec email...');
    const signInResponse = await fetch(`${baseURL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email: 'test@example.com',  // Utiliser email au lieu de username
        password: 'test123',
        csrfToken: csrfToken,
      }),
      redirect: 'manual'
    });
    
    const cookies = signInResponse.headers.raw()['set-cookie'];
    const sessionCookie = cookies?.join('; ');
    console.log('Status de connexion:', signInResponse.status);
    console.log('Cookies de session:', cookies ? 'Reçus' : 'Non reçus');
    
    // 3. Vérifier la session
    if (cookies) {
      console.log('\n3. Vérification de la session...');
      const sessionResponse = await fetch(`${baseURL}/api/auth/session`, {
        headers: {
          'Cookie': sessionCookie
        }
      });
      const sessionData = await sessionResponse.json();
      console.log('Session:', sessionData);
      
      // 4. Créer un lien
      if (sessionData.user) {
        console.log('\n4. Création d\'un lien...');
        const linkData = {
          title: "Test Link avec Auth",
          description: "Test après correction auth",
          color: "#3b82f6",
          multiLinks: [
            {
              title: "Google",
              url: "https://google.com",
              description: "Moteur de recherche"
            },
            {
              title: "GitHub",
              url: "https://github.com"
            }
          ]
        };
        
        const createResponse = await fetch(`${baseURL}/api/links`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': sessionCookie
          },
          body: JSON.stringify(linkData)
        });
        
        const responseText = await createResponse.text();
        console.log('Status de création:', createResponse.status);
        
        if (createResponse.status === 201) {
          const link = JSON.parse(responseText);
          console.log('✅ Lien créé avec succès !');
          console.log('URL:', `${baseURL}/link/${link.slug}`);
          console.log('ID:', link.id);
        } else {
          console.log('❌ Erreur:', responseText);
        }
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testAPI();