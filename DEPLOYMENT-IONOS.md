# Guide de déploiement sur IONOS

## ⚠️ Important
Votre projet TapLinkr utilise des fonctionnalités dynamiques (NextAuth, API routes, base de données) qui nécessitent un serveur Node.js. L'hébergement web classique IONOS ne supporte pas Node.js.

## Options recommandées :

### Option 1: IONOS Cloud Server ou VPS (Recommandé)
Si vous avez accès à un serveur IONOS avec Node.js :

1. **Préparer le projet**
```bash
# Build de production
npm run build

# Tester localement
npm run start
```

2. **Configurer les variables d'environnement sur le serveur**
Créer un fichier `.env.production` avec :
```
DATABASE_URL="votre_url_base_de_donnees"
NEXTAUTH_URL="https://votredomaine.com"
NEXTAUTH_SECRET="générer_avec_openssl_rand_base64_32"
```

3. **Déployer avec PM2**
```bash
# Installer PM2
npm install -g pm2

# Démarrer l'application
pm2 start npm --name "taplinkr" -- start

# Sauvegarder la configuration
pm2 save
pm2 startup
```

### Option 2: Utiliser un hébergeur compatible Node.js
Services recommandés pour Next.js :
- **Vercel** (gratuit, optimisé pour Next.js)
- **Netlify** 
- **Railway**
- **Render**

### Option 3: Dockeriser et déployer sur IONOS
Si IONOS supporte Docker :

1. Créer un Dockerfile
2. Build et push l'image
3. Déployer sur IONOS

## Configuration de production requise

### Base de données
- PostgreSQL ou MySQL hébergé (Supabase, PlanetScale, etc.)
- Mettre à jour DATABASE_URL

### Domaine
1. Dans IONOS, pointer votre domaine vers :
   - L'IP du serveur (Option 1)
   - Les nameservers du service choisi (Option 2)

### SSL/HTTPS
- Obligatoire pour NextAuth
- Utiliser Let's Encrypt ou le SSL IONOS

## Scripts utiles

### Vérifier la production localement
```bash
npm run build && npm run start
```

### Générer NEXTAUTH_SECRET
```bash
openssl rand -base64 32
```

## Variables d'environnement production

```env
# Base de données
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://taplinkr.com"
NEXTAUTH_SECRET="votre_secret_genere"

# Optionnel : Email
EMAIL_SERVER=""
EMAIL_FROM=""

# Optionnel : Upload
UPLOAD_DIR="./public/uploads"
```

## Recommandation

Pour un déploiement rapide et gratuit, je recommande **Vercel** :
1. Connectez votre repo GitHub
2. Configurez les variables d'environnement
3. Déployez automatiquement

Ensuite, pointez votre domaine IONOS vers Vercel.