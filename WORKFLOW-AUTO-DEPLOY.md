# 🚀 Workflow de Déploiement Automatique

## Configuration Initiale

### 1. Connexion à votre base Supabase
Vous devez obtenir les informations de connexion depuis votre projet Supabase :
1. Connectez-vous à [app.supabase.com](https://app.supabase.com)
2. Sélectionnez votre projet
3. Allez dans Settings > Database
4. Copiez l'URI de connexion (Connection string > URI)

### 2. Mettre à jour le fichier .env
```env
DATABASE_URL="votre-url-supabase-ici"
```

## Utilisation des Scripts

### Déploiement Manuel
Pour déployer manuellement après des modifications :
```powershell
.\auto-deploy.ps1
```

Ou avec un message personnalisé :
```powershell
.\auto-deploy.ps1 -message "🎨 Ajout de nouvelles fonctionnalités"
```

### Déploiement Automatique (Recommandé)
Lancez le mode surveillance pour un déploiement automatique :
```powershell
.\watch-deploy.ps1
```

Ce script :
- 👀 Surveille tous les changements de fichiers
- ⚡ Commit et push automatiquement
- 🚀 Déclenche le redéploiement sur Vercel
- 🔄 Continue jusqu'à ce que vous l'arrêtiez (Ctrl+C)

## Configuration Vercel

Assurez-vous que votre projet Vercel est configuré pour :
1. Se redéployer automatiquement à chaque push sur `main`
2. Avoir les bonnes variables d'environnement

Variables nécessaires sur Vercel :
- `DATABASE_URL` - URL de votre base Supabase
- `NEXTAUTH_SECRET` - Secret pour NextAuth
- `NEXTAUTH_URL` - URL de production (ex: https://taplinkr.com)
- Toutes les autres variables de `.env.production`

## Workflow Recommandé

1. **Démarrer le développement**
   ```powershell
   # Terminal 1 : Lancer l'app
   npm run dev
   
   # Terminal 2 : Lancer la surveillance
   .\watch-deploy.ps1
   ```

2. **Modifier votre code**
   - Éditez vos fichiers normalement
   - Sauvegardez
   - Le déploiement se fait automatiquement !

3. **Vérifier le déploiement**
   - Dashboard Vercel : [vercel.com/dashboard](https://vercel.com/dashboard)
   - Logs de build en temps réel
   - URL de preview pour chaque déploiement

## ⚠️ Notes Importantes

- **Sécurité** : Ne jamais committer `.env` ou `.env.local`
- **Performance** : Le script attend 2 secondes entre les changements pour éviter les déploiements multiples
- **Exclusions** : Les dossiers `node_modules`, `.git`, `.next` sont ignorés
- **Branches** : Assurez-vous d'être sur la branche `main` pour les déploiements automatiques

## Commandes Git Utiles

```powershell
# Vérifier le statut
git status

# Voir l'historique des déploiements
git log --oneline -10

# Annuler le dernier commit (si pas encore pushé)
git reset --soft HEAD~1

# Forcer la synchronisation avec GitHub
git pull origin main --rebase
git push origin main
```