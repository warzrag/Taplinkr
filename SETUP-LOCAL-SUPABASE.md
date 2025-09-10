# 🚀 Guide d'installation TapLinkr avec Supabase

## 📋 Prérequis
- Node.js 18+ installé
- Compte Supabase créé (ou utiliser la base existante)
- Git installé

## 🔧 Installation étape par étape

### 1. Naviguer vers le dossier du projet
```bash
cd /mnt/d/claude/taplinkr-github
```

### 2. Installer les dépendances
```bash
npm install
```

### 3. Configuration de la base de données Supabase

#### Option A : Utiliser la base de données existante
Le fichier `.env.local` est déjà configuré avec une base Supabase fonctionnelle.

#### Option B : Créer votre propre base Supabase
1. Créez un compte sur [Supabase](https://supabase.com)
2. Créez un nouveau projet
3. Récupérez vos clés dans Settings > API
4. Mettez à jour `.env.local` avec vos clés

### 4. Initialiser la base de données

#### Méthode 1 : Via l'interface Supabase
1. Connectez-vous à [Supabase](https://supabase.com)
2. Allez dans SQL Editor
3. Copiez le contenu de `SUPABASE-COMPLETE.sql`
4. Exécutez le script

#### Méthode 2 : Via Prisma (recommandé)
```bash
# Générer le client Prisma
npm run db:generate

# Pousser le schéma vers Supabase
npm run db:push
```

### 5. Créer un utilisateur admin (optionnel)
```bash
# Exécuter le script de création d'admin
npx ts-node scripts/create-admin-flore.ts
```

### 6. Lancer l'application
```bash
npm run dev
```

L'application sera accessible sur : http://localhost:3000

## 🔍 Vérification

### Tester la connexion à la base
1. Ouvrez http://localhost:3000
2. Créez un compte ou connectez-vous
3. Créez un premier lien

### Interface Prisma Studio
```bash
npm run db:studio
```
Accessible sur : http://localhost:5555

## 📝 Comptes de test

### Compte Admin
- Email : admin@taplinkr.com
- Mot de passe : Admin123!

### Compte Demo
- Email : demo@taplinkr.com
- Mot de passe : Demo123!

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Base de données
npm run db:push     # Synchroniser le schéma
npm run db:studio   # Interface graphique
npm run db:generate # Générer le client Prisma

# Création d'utilisateurs
npx ts-node scripts/create-admin.ts
npx ts-node scripts/create-demo-user.ts
```

## ⚠️ Troubleshooting

### Erreur de connexion à la base
1. Vérifiez que les variables d'environnement sont correctes
2. Vérifiez votre connexion internet
3. Assurez-vous que votre IP est autorisée dans Supabase

### Erreur Prisma
```bash
# Régénérer le client
rm -rf node_modules/.prisma
npm run db:generate
```

### Port 3000 déjà utilisé
```bash
# Lancer sur un autre port
PORT=3001 npm run dev
```

## 📚 Documentation

- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Next.js Docs](https://nextjs.org/docs)

## 🔐 Sécurité

⚠️ **IMPORTANT** : Ne jamais committer le fichier `.env.local` !
- Ajoutez `.env.local` à votre `.gitignore`
- Utilisez des variables d'environnement différentes en production
- Changez `NEXTAUTH_SECRET` en production