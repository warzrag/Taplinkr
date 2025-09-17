-- Migration pour ajouter la colonne sessionVersion à la table User
-- À exécuter dans Supabase SQL Editor une fois que l'authentification fonctionne à nouveau

-- 1. Ajouter la colonne sessionVersion
ALTER TABLE "users" 
ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER DEFAULT 0;

-- 2. Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'sessionVersion';

-- 3. Après cette migration, vous pourrez réactiver le code de session invalidation:
-- - Dans /lib/auth.ts : Décommenter toutes les références à sessionVersion
-- - Dans /types/next-auth.d.ts : Décommenter sessionVersion
-- - Dans /app/api/teams/members/[id]/route.ts : Décommenter l'incrémentation