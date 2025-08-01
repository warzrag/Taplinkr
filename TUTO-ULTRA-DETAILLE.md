# 📱 TUTORIEL ULTRA DÉTAILLÉ - Déploiement TapLinkr

## 🔵 PARTIE 1 : CRÉER UN COMPTE VERCEL

### 1. Ouvrir Vercel
- Ouvrez votre navigateur
- Tapez : **vercel.com**
- Cliquez sur le bouton **"Sign Up"** (en haut à droite)

### 2. S'inscrire
- Cliquez sur **"Continue with GitHub"** (bouton noir avec logo GitHub)
- Si vous n'avez pas GitHub :
  - Cliquez sur **"Continue with Email"**
  - Entrez votre email
  - Créez un mot de passe

### 3. Vérifier votre email
- Allez dans votre boîte mail
- Ouvrez l'email de Vercel
- Cliquez sur **"Verify Email"**

---

## 🟢 PARTIE 2 : CRÉER UNE BASE DE DONNÉES GRATUITE

### 1. Ouvrir Supabase
- Nouvel onglet : **supabase.com**
- Cliquez sur **"Start your project"** (bouton vert)

### 2. S'inscrire à Supabase
- Cliquez sur **"Sign Up"**
- Utilisez votre email
- Ou connectez-vous avec GitHub

### 3. Créer votre projet
- Cliquez sur **"New project"**
- Remplissez :
  - **Name** : taplinkr
  - **Database Password** : Créez un mot de passe fort (notez-le !)
  - **Region** : Europe (Frankfurt)
- Cliquez sur **"Create new project"**
- ⏰ Attendez 2-3 minutes

### 4. Récupérer l'URL de la base de données
- Une fois créé, cliquez sur **"Settings"** (engrenage à gauche)
- Cliquez sur **"Database"**
- Cherchez **"Connection string"**
- Cliquez sur **"URI"**
- 📋 **COPIEZ** cette longue URL qui commence par `postgresql://`

---

## 🟡 PARTIE 3 : PRÉPARER VOTRE PROJET

### 1. Ouvrir le terminal WSL
- Appuyez sur **Windows + R**
- Tapez : **wsl**
- Appuyez sur **Entrée**

### 2. Aller dans votre projet
```bash
cd /mnt/d/OFM/link/get/Nouveau\ dossier/V3
```

### 3. Créer le fichier de configuration Prisma
```bash
npx prisma db push
```
- Si ça demande d'installer, tapez **y** et Entrée

---

## 🔴 PARTIE 4 : DÉPLOYER SUR VERCEL

### 1. Lancer le déploiement
Dans le terminal, tapez :
```bash
npx vercel
```

### 2. Répondre aux questions (TRÈS IMPORTANT)

**Question 1** : `Set up and deploy "~/V3"?`
- Tapez : **y**
- Appuyez sur **Entrée**

**Question 2** : `Which scope do you want to deploy to?`
- Utilisez les flèches pour sélectionner votre nom
- Appuyez sur **Entrée**

**Question 3** : `Link to existing project?`
- Tapez : **n**
- Appuyez sur **Entrée**

**Question 4** : `What's your project's name?`
- Tapez : **taplinkr**
- Appuyez sur **Entrée**

**Question 5** : `In which directory is your code located?`
- Appuyez juste sur **Entrée** (garde le ./)

**Question 6** : `Want to override the settings?`
- Tapez : **n**
- Appuyez sur **Entrée**

### 3. Attendre
- ⏰ Le déploiement prend 2-5 minutes
- Vous verrez une URL à la fin (ex: taplinkr-xyz.vercel.app)

---

## 🟣 PARTIE 5 : CONFIGURER LES VARIABLES

### 1. Aller sur Vercel
- Ouvrez : **vercel.com/dashboard**
- Vous devriez voir votre projet **"taplinkr"**
- Cliquez dessus

### 2. Aller dans les paramètres
- En haut, cliquez sur **"Settings"**
- Dans le menu de gauche, cliquez sur **"Environment Variables"**

### 3. Ajouter la base de données
- Dans le champ **"Key"** tapez : `DATABASE_URL`
- Dans le grand champ **"Value"** : 
  - Collez l'URL copiée de Supabase (étape 2.4)
  - ⚠️ REMPLACEZ `[YOUR-PASSWORD]` par votre mot de passe Supabase
- Cliquez sur **"Add"**

### 4. Ajouter l'URL du site
- **"Key"** : `NEXTAUTH_URL`
- **"Value"** : `https://tapelinkr.com`
- Cliquez sur **"Add"**

### 5. Ajouter le secret
- **"Key"** : `NEXTAUTH_SECRET`
- **"Value"** : `o1cUa6bd7tol6DYksF3rTyyl+fbPrnIhr88y0+RRjyk=`
- Cliquez sur **"Add"**

### 6. Redéployer
- En haut à droite, cliquez sur **"Deployments"**
- Cliquez sur les **3 points** (...) du dernier déploiement
- Cliquez sur **"Redeploy"**
- Cliquez sur **"Redeploy"** dans la popup

---

## 🟠 PARTIE 6 : CONFIGURER VOTRE DOMAINE

### 1. Dans Vercel
- Cliquez sur **"Settings"**
- Cliquez sur **"Domains"**
- Tapez : **tapelinkr.com**
- Cliquez sur **"Add"**

### 2. Noter les informations
Vercel va vous montrer 2 choses :
- Pour **tapelinkr.com** : Une adresse IP (76.76.21.21)
- Pour **www.tapelinkr.com** : cname.vercel-dns.com

### 3. Aller sur IONOS
- Connectez-vous à IONOS
- Cliquez sur **"Domaines & SSL"**
- Trouvez **tapelinkr.com**
- Cliquez sur **"Gérer le domaine"**
- Cliquez sur **"DNS"**

### 4. Configurer le domaine principal
- Cliquez sur **"Ajouter un enregistrement"**
- **Type** : Sélectionnez **A**
- **Nom d'hôte** : Laissez vide ou mettez **@**
- **Valeur** : **76.76.21.21**
- **TTL** : 3600
- Cliquez sur **"Enregistrer"**

### 5. Configurer le www
- Cliquez sur **"Ajouter un enregistrement"**
- **Type** : Sélectionnez **CNAME**
- **Nom d'hôte** : **www**
- **Valeur** : **cname.vercel-dns.com**
- **TTL** : 3600
- Cliquez sur **"Enregistrer"**

---

## ✅ PARTIE 7 : VÉRIFIER

### 1. Attendre
- ⏰ Attendez 10-30 minutes (propagation DNS)

### 2. Tester
- Ouvrez : **https://tapelinkr.com**
- Si ça ne marche pas, attendez encore un peu

### 3. Créer votre compte admin
- Une fois le site accessible
- Inscrivez-vous avec votre email
- C'est votre compte administrateur !

---

## 🆘 PROBLÈMES FRÉQUENTS

### "Application error"
- Vérifiez les variables d'environnement
- Vérifiez le mot de passe dans DATABASE_URL

### "Site inaccessible"
- Attendez plus longtemps (DNS)
- Vérifiez la configuration IONOS

### "Erreur de build"
- Dans Vercel, cliquez sur le déploiement
- Regardez les logs d'erreur
- Contactez-moi avec l'erreur

---

## 📞 BESOIN D'AIDE ?

Si vous êtes bloqué à une étape, dites-moi :
1. À quelle étape vous êtes
2. Ce que vous voyez à l'écran
3. Le message d'erreur exact

Je suis là pour vous aider ! 🚀