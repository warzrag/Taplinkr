-- SCRIPT DE CORRECTION POUR CRÉER UN COMPTE ADMIN
-- 
-- INSTRUCTIONS :
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez-collez TOUT ce code
-- 3. Cliquez sur "Run"

-- D'abord, vérifions si la table User existe et affichons sa structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'User';

-- Supprimons l'ancien admin s'il existe
DELETE FROM "User" WHERE email = 'admin@taplinkr.com';

-- Créons un nouvel admin avec le bon hash de mot de passe
INSERT INTO "User" (
    id,
    email,
    password,
    username,
    name,
    role,
    plan,
    "emailVerified",
    "createdAt",
    "updatedAt"
) VALUES (
    gen_random_uuid()::text,
    'admin@taplinkr.com',
    '$2a$12$KIGhxdhfqEJG2gDQP3J4AeZxQ5iVdVxPQWEgchxvZvE6CyvWF1bxK', -- Password: Admin123!
    'admin',
    'Administrateur',
    'ADMIN',
    'premium',
    true,
    NOW(),
    NOW()
);

-- Vérifions que l'utilisateur a bien été créé
SELECT id, email, username, role, plan, "emailVerified" 
FROM "User" 
WHERE email = 'admin@taplinkr.com';

-- Message de confirmation
SELECT 
    '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !' as "Status",
    'admin@taplinkr.com' as "Email",
    'Admin123!' as "Mot de passe",
    'https://www.taplinkr.com/auth/signin' as "URL de connexion";