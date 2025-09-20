# 🚨 SOLUTION POUR ACTIVER LE DÉPLOIEMENT AUTOMATIQUE VERCEL

## ✅ ÉTAPES À SUIVRE MAINTENANT (5 minutes max)

### 1️⃣ Obtenir votre token Vercel
1. Allez sur : https://vercel.com/account/tokens
2. Cliquez sur "Create"
3. Nom : `github-deployment`
4. Scope : "Full Account"
5. Expiration : "No Expiration"
6. Cliquez "Create Token"
7. **COPIEZ LE TOKEN** (il ne sera plus visible après !)

### 2️⃣ Ajouter les secrets dans GitHub
1. Allez sur : https://github.com/warzrag/Taplinkr/settings/secrets/actions
2. Cliquez sur "New repository secret"
3. Ajoutez ces 3 secrets :

#### Secret 1 : VERCEL_TOKEN
- Name : `VERCEL_TOKEN`
- Secret : *Collez le token copié à l'étape 1*

#### Secret 2 : VERCEL_ORG_ID
- Name : `VERCEL_ORG_ID`
- Secret : `team_gx5Yd6vDfHNKqKZNWSXV6xkv`

#### Secret 3 : VERCEL_PROJECT_ID
- Name : `VERCEL_PROJECT_ID`
- Secret : `prj_MUmj2IEThm1PwuDjGkap2EIpKp5q`

### 3️⃣ Tester le déploiement
Une fois les 3 secrets ajoutés, le prochain push déclenchera automatiquement le déploiement !

## 🎯 CE QUI A ÉTÉ FAIT

✅ Création du workflow GitHub Actions : `.github/workflows/vercel.yml`
✅ Configuration pour déployer automatiquement sur chaque push vers `main`

## 📊 VÉRIFICATION

Après avoir ajouté les secrets, allez sur :
https://github.com/warzrag/Taplinkr/actions

Vous verrez le workflow se déclencher automatiquement à chaque push !

## ⚠️ IMPORTANT
Sans ces 3 secrets, le déploiement automatique NE FONCTIONNERA PAS.
C'est la seule étape manuelle nécessaire.