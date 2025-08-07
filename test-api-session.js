const fetch = require('node-fetch');

async function testAPI() {
  const baseURL = 'http://localhost:3000';
  
  try {
    // 1. Obtenir le CSRF token
    console.log('1. Obtention du CSRF token...');
    const csrfResponse = await fetch(`${baseURL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;
    console.log('CSRF Token:', csrfToken);
    
    // 2. Se connecter
    console.log('\n2. Connexion...');
    const signInResponse = await fetch(`${baseURL}/api/auth/signin/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: 'testuser',
        password: 'test123',
        csrfToken: csrfToken,
        redirect: 'false',
        json: 'true'
      }),
      redirect: 'manual'
    });
    
    const signInText = await signInResponse.text();
    console.log('SignIn Response:', signInText);
    
    // Récupérer le cookie de session
    const cookies = signInResponse.headers.raw()['set-cookie'];
    const sessionCookie = cookies?.find(c => c.includes('next-auth.session-token'));
    console.log('Session Cookie:', sessionCookie ? 'Trouvé' : 'Non trouvé');
    
    if (!sessionCookie) {
      // Essayer avec callback/credentials
      console.log('\n3. Tentative avec callback/credentials...');
      const callbackResponse = await fetch(`${baseURL}/api/auth/callback/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          username: 'testuser',
          password: 'test123',
          csrfToken: csrfToken,
        }),
        redirect: 'manual'
      });
      
      const callbackCookies = callbackResponse.headers.raw()['set-cookie'];
      const callbackSession = callbackCookies?.join('; ');
      console.log('Callback Status:', callbackResponse.status);
      console.log('Callback Cookies:', callbackCookies ? 'Trouvés' : 'Non trouvés');
      
      // 4. Créer un lien avec le cookie de session
      if (callbackCookies) {
        console.log('\n4. Création d\'un lien...');
        const linkData = {
          title: "Test Link Debug",
          description: "Test pour débugger l'erreur 500",
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
            'Cookie': callbackSession
          },
          body: JSON.stringify(linkData)
        });
        
        const responseText = await createResponse.text();
        console.log('Create Link Status:', createResponse.status);
        console.log('Create Link Response:', responseText);
      }
    }
    
  } catch (error) {
    console.error('Erreur:', error);
  }
}

testAPI();