-- SCRIPT FINAL POUR CRÉER LE COMPTE ADMIN
-- ⚠️ UTILISEZ CE SCRIPT DANS SUPABASE SQL EDITOR
-- 
-- INSTRUCTIONS :
-- 1. Allez dans votre projet Supabase
-- 2. Cliquez sur "SQL Editor" dans le menu à gauche
-- 3. Copiez-collez TOUT ce code
-- 4. Cliquez sur "Run"

-- Supprimer l'ancien admin s'il existe
DELETE FROM "User" WHERE email = 'admin@taplinkr.com';

-- Créer le compte admin avec le BON hash de mot de passe
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
    '$2a$12$lvsnh2cUY6/nKUwieP8EmuKXQXPMPdLI.M7YkWbZXFyj//K8GBpZi', -- Password: Admin123!
    'admin',
    'Administrateur',
    'ADMIN',
    'premium',
    true,
    NOW(),
    NOW()
);

-- Vérifier que l'utilisateur a bien été créé
SELECT 
    '✅ COMPTE ADMIN CRÉÉ AVEC SUCCÈS !' as "Message",
    '=================================' as "=====",
    'admin@taplinkr.com' as "📧 Email",
    'Admin123!' as "🔑 Mot de passe",
    'https://www.taplinkr.com/auth/signin' as "🌐 URL"
FROM "User" 
WHERE email = 'admin@taplinkr.com';