# Configuration rapide Google OAuth (5 minutes)

## Étapes essentielles

### 1. Aller sur Google Cloud Console
👉 https://console.cloud.google.com/

### 2. Créer un nouveau projet
- Cliquer sur le sélecteur de projet en haut
- "Nouveau projet" 
- Nom: "LinkTracker Dev"
- Créer

### 3. Activer l'API
- Menu → "APIs et services" → "Bibliothèque"
- Rechercher "Google+ API"
- Cliquer et "Activer"

### 4. Créer les credentials
- Menu → "APIs et services" → "Identifiants"
- "+ CRÉER DES IDENTIFIANTS" → "ID client OAuth"

### 5. Configurer l'écran de consentement (si demandé)
- Type: Externe
- Nom: LinkTracker
- Email: votre email
- Enregistrer

### 6. Configuration OAuth
- Type d'application: **Application Web**
- Nom: "LinkTracker Local"
- URI de redirection autorisées, ajouter:
  ```
  http://localhost:3000/api/auth/callback/google
  ```
- Créer

### 7. Copier les credentials
Une fenêtre s'affiche avec:
- **ID client**: quelque-chose.apps.googleusercontent.com
- **Secret client**: GOCSPX-quelquechose

### 8. Mettre à jour .env.local
Remplacer les valeurs dans `.env.local`:
```env
GOOGLE_CLIENT_ID=votre-id-client-ici
GOOGLE_CLIENT_SECRET=votre-secret-ici
```

### 9. Redémarrer le serveur
```bash
# Arrêter avec Ctrl+C puis:
npm run dev
```

## ⚡ C'est tout !
Les boutons Google devraient maintenant fonctionner.