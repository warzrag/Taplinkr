# Configuration de Google OAuth pour LinkTracker

## Prérequis
- Un compte Google
- Accès à Google Cloud Console

## Étapes de configuration

### 1. Créer un projet Google Cloud
1. Aller sur [Google Cloud Console](https://console.cloud.google.com/)
2. Cliquer sur le sélecteur de projet en haut
3. Cliquer sur "Nouveau projet"
4. Nommer le projet (ex: "LinkTracker")
5. Cliquer sur "Créer"

### 2. Activer l'API Google+ 
1. Dans le menu de navigation, aller dans "APIs et services" > "Bibliothèque"
2. Rechercher "Google+ API"
3. Cliquer sur "Google+ API"
4. Cliquer sur "Activer"

### 3. Créer les identifiants OAuth 2.0
1. Aller dans "APIs et services" > "Identifiants"
2. Cliquer sur "+ CRÉER DES IDENTIFIANTS" > "ID client OAuth"
3. Si demandé, configurer l'écran de consentement OAuth :
   - Type d'utilisateur : Externe
   - Nom de l'application : LinkTracker
   - Email d'assistance : votre email
   - Domaines autorisés : votre domaine (si en production)
   - Cliquer sur "Enregistrer et continuer"
4. Pour le type d'application, choisir "Application Web"
5. Nommer l'ID client (ex: "LinkTracker Web")
6. Ajouter les URIs de redirection autorisées :
   - Pour le développement : `http://localhost:3000/api/auth/callback/google`
   - Pour la production : `https://votre-domaine.com/api/auth/callback/google`
7. Cliquer sur "Créer"

### 4. Récupérer les identifiants
1. Une fenêtre s'ouvre avec vos identifiants
2. Copier l'ID client et le secret client

### 5. Configurer les variables d'environnement
Ajouter ces lignes dans votre fichier `.env.local` :

```env
GOOGLE_CLIENT_ID=votre-id-client-google
GOOGLE_CLIENT_SECRET=votre-secret-client-google
```

### 6. Redémarrer l'application
```bash
npm run dev
```

## Test de la fonctionnalité
1. Aller sur la page de connexion ou d'inscription
2. Cliquer sur "Continuer avec Google" ou "S'inscrire avec Google"
3. Sélectionner votre compte Google
4. Autoriser l'application
5. Vous devriez être redirigé vers le dashboard

## Notes importantes
- Les utilisateurs Google sont automatiquement vérifiés (emailVerified: true)
- Un username est généré automatiquement à partir de l'email
- Aucun mot de passe n'est stocké pour les comptes OAuth
- L'image de profil Google est synchronisée

## Dépannage
- Si vous obtenez une erreur 400 : vérifiez les URIs de redirection
- Si l'authentification échoue : vérifiez que l'API Google+ est activée
- Si les variables d'environnement ne sont pas prises en compte : redémarrer le serveur