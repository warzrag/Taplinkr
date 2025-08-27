# Configuration Supabase pour TapLinkr

## 1. Récupérez votre mot de passe Supabase

Dans Supabase, allez dans :
- Settings → Database
- Section "Connection string"
- Cliquez sur "Reset database password" si vous l'avez oublié
- Ou utilisez le mot de passe que vous avez défini lors de la création du projet

## 2. Créez le fichier .env.local

Créez un fichier `.env.local` dans le dossier Taplinkr avec :

```
DATABASE_URL="postgresql://postgres:VOTRE-MOT-DE-PASSE@db.dkwgorynhgnmldzbhhrb.supabase.co:5432/postgres"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="supersecretkey12345changeme"
```

Remplacez VOTRE-MOT-DE-PASSE par votre vrai mot de passe Supabase.

## 3. Sur Vercel

Les mêmes variables doivent être configurées dans :
- Vercel Dashboard → Votre projet → Settings → Environment Variables

DATABASE_URL doit avoir la même valeur avec votre mot de passe.

## 4. Test de connexion

Une fois configuré, lancez :
```bash
npx tsx diagnostic-complete.ts
```

Cela vérifiera la connexion et listera tous les utilisateurs.