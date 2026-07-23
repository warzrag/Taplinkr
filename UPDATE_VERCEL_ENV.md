# IMPORTANT : Mettre à jour les variables sur Vercel

## 1. Va sur Supabase
- https://supabase.com/dashboard/project/dkwgorynhgnmldzbhhrb
- Clique sur "Settings" → "Database"
- Dans "Connection string", choisis l'onglet "URI"
- Prends la "Direct connection" (PAS le pooler)
- Elle ressemble à : `postgresql://postgres:[YOUR-PASSWORD]@db.dkwgorynhgnmldzbhhrb.supabase.co:5432/postgres`

## 2. Va sur Vercel
- https://vercel.com/dashboard
- Sélectionne ton projet "Taplinkr"
- Va dans Settings → Environment Variables

## 3. Mets à jour DATABASE_URL
Remplace l'ancienne valeur par la DIRECT connection :

```
DATABASE_URL = [URL PostgreSQL fournie par Supabase]
```

Note : Utilise `db.` au lieu de `aws-0-eu-west-3.pooler.`

## 4. Vérifie les autres variables
```
NEXTAUTH_URL = https://www.taplinkr.com
NEXTAUTH_SECRET = [nouveau secret généré avec openssl rand -base64 32]
```

## 5. Redéploie
- Clique sur "Save"
- Puis "Redeploy" dans Vercel

## Alternative : Si la direct connection ne fonctionne pas
Essaye avec la Session pooler :
```
DATABASE_URL = [URL du pooler Supabase, sans l’inscrire dans Git]
```

Note le port 6543 et `?pgbouncer=true` à la fin
