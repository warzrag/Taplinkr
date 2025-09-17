-- Ajouter la colonne sessionVersion à la table User
-- À exécuter dans Supabase SQL Editor

ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "sessionVersion" INTEGER DEFAULT 0;

-- Vérifier que la colonne a été ajoutée
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'User' AND column_name = 'sessionVersion';