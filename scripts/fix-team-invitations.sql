-- Script pour corriger la table team_invitations dans Supabase
-- Supprime la contrainte de clé étrangère qui pose problème

-- 1. Supprimer la contrainte de clé étrangère existante
ALTER TABLE team_invitations 
DROP CONSTRAINT IF EXISTS team_invitations_email_fkey;

-- 2. Vérifier que la table est bien configurée
-- La colonne email doit être juste un text, pas une référence
ALTER TABLE team_invitations
ALTER COLUMN email TYPE text;

-- 3. Afficher la structure pour vérification
SELECT 
    column_name,
    data_type,
    is_nullable
FROM 
    information_schema.columns
WHERE 
    table_name = 'team_invitations'
ORDER BY 
    ordinal_position;