# 🚀 Guide de déploiement TapLinkr sur tapelinkr.com

## Étape 1 : Créer un compte Vercel
1. Allez sur https://vercel.com
2. Cliquez sur "Sign Up"
3. Connectez-vous avec GitHub (recommandé)

## Étape 2 : Préparer la base de données
Vous avez besoin d'une base de données en ligne. Je recommande **Supabase** (gratuit) :

1. Allez sur https://supabase.com
2. Créez un compte et un nouveau projet
3. Une fois créé, allez dans Settings → Database
4. Copiez l'URL de connexion (Connection string → URI)

## Étape 3 : Déployer sur Vercel

Dans votre terminal WSL, exécutez :

```bash
cd /mnt/d/OFM/link/get/Nouveau\ dossier/V3
npx vercel
```

Répondez aux questions :
- Set up and deploy? → **Y**
- Which scope? → Choisissez votre compte
- Link to existing project? → **N**
- Project name? → **taplinkr**
- Directory? → **.**
- Override settings? → **N**

## Étape 4 : Configurer les variables d'environnement

1. Allez sur https://vercel.com/dashboard
2. Cliquez sur votre projet **taplinkr**
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez ces variables :

```
DATABASE_URL = [URL de Supabase copiée à l'étape 2]
NEXTAUTH_URL = https://tapelinkr.com
NEXTAUTH_SECRET = [générez avec la commande ci-dessous]
```

Pour générer NEXTAUTH_SECRET, exécutez :
```bash
openssl rand -base64 32
```

## Étape 5 : Redéployer avec les variables

```bash
npx vercel --prod
```

## Étape 6 : Configurer votre domaine IONOS

1. Dans Vercel :
   - Allez dans votre projet → **Settings** → **Domains**
   - Ajoutez **tapelinkr.com**
   - Vercel vous donnera des instructions

2. Dans IONOS :
   - Connectez-vous à votre compte IONOS
   - Allez dans **Domaines & SSL** → **tapelinkr.com**
   - Cliquez sur **DNS**
   - Ajoutez ces enregistrements :

   **Pour tapelinkr.com :**
   - Type : **A**
   - Nom : **@**
   - Valeur : **76.76.21.21**

   **Pour www.tapelinkr.com :**
   - Type : **CNAME**
   - Nom : **www**
   - Valeur : **cname.vercel-dns.com**

3. Attendez 5-30 minutes pour la propagation DNS

## ✅ C'est fait !

Votre site sera accessible sur :
- https://tapelinkr.com
- https://www.tapelinkr.com

## 🔧 Commandes utiles

**Voir les logs :**
```bash
npx vercel logs
```

**Redéployer :**
```bash
npx vercel --prod
```

**Vérifier le statut :**
```bash
npx vercel ls
```

## ⚠️ Important
- La base de données doit être accessible depuis Internet
- Les uploads d'images devront être configurés séparément (Cloudinary recommandé)
- Le SSL est automatique avec Vercel