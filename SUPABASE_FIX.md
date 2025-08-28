# 🚨 URGENT : Corriger la connexion Supabase

## Le problème
La base de données Supabase ne répond pas. Voici comment corriger :

## 1. Va sur Supabase
https://supabase.com/dashboard/project/dkwgorynhgnmldzbhhrb

## 2. Vérifie l'état du projet
- Si tu vois "Project is paused", clique sur "Restore project"
- Attends que le statut soit "Active"

## 3. Récupère la BONNE connection string
- Va dans Settings → Database
- Clique sur "Connection Pooling" 
- Choisis "Transaction" mode
- Copie la connection string qui ressemble à :
```
postgresql://postgres.dkwgorynhgnmldzbhhrb:[YOUR-PASSWORD]@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

## 4. Sur Vercel, mets à jour DATABASE_URL
https://vercel.com/dashboard → Taplinkr → Settings → Environment Variables

Essaye ces différentes options dans l'ordre :

### Option 1 : Transaction Pooler (recommandé)
```
postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:6543/postgres
```

### Option 2 : Session Pooler
```
postgresql://postgres.dkwgorynhgnmldzbhhrb:Fortnite95!!@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

### Option 3 : Direct (si les poolers ne marchent pas)
```
postgresql://postgres:Fortnite95!!@db.dkwgorynhgnmldzbhhrb.supabase.co:5432/postgres
```

## 5. IMPORTANT : Après chaque changement
- Save
- Redeploy sur Vercel
- Teste sur https://www.taplinkr.com/api/check-db

## Si rien ne fonctionne
Le projet Supabase est peut-être pausé ou a un problème. Dans ce cas :
1. Va sur Supabase Dashboard
2. Vérifie que le projet est "Active"
3. Si pausé, clique sur "Restore"
4. Si toujours des problèmes, regarde les "Database Settings" pour voir s'il y a des alertes