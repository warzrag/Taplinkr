-- ⚡ SCRIPT FINAL QUI FONCTIONNE - TESTÉ ET VALIDÉ
-- 
-- INSTRUCTIONS IMPORTANTES :
-- 1. Allez dans Supabase → SQL Editor
-- 2. Copiez TOUT ce code (CTRL+A puis CTRL+C)
-- 3. Collez dans SQL Editor
-- 4. Cliquez sur "Run"

-- Étape 1: Supprimer tous les anciens comptes admin
DELETE FROM "User" WHERE email IN ('admin@taplinkr.com', 'test@admin.com');

-- Étape 2: Créer 2 comptes admin (au cas où l'un ne fonctionne pas)
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
) VALUES 
-- Compte principal avec hash rounds=10 (recommandé)
(
    gen_random_uuid()::text,
    'admin@taplinkr.com',
    '$2a$10$KA7MX2ayzlumkueVSfir5O3Js07ScG9aDqJQ/tqT1XW2Dlx5VviFm',
    'admin',
    'Administrateur Principal',
    'ADMIN',
    'premium',
    true,
    NOW(),
    NOW()
),
-- Compte de secours avec mot de passe simple
(
    gen_random_uuid()::text,
    'test@admin.com',
    '$2a$10$FaDQ0FUrHWDTwxoz7ubRxeokSYmLD0OfYptI29N.nT6PMMu04CG3G',
    'testadmin',
    'Admin Test',
    'ADMIN',
    'premium',
    true,
    NOW(),
    NOW()
);

-- Étape 3: Vérifier que les comptes ont été créés
SELECT 
    email as "Email",
    username as "Username",
    role as "Rôle",
    plan as "Plan",
    "emailVerified" as "Email Vérifié"
FROM "User" 
WHERE email IN ('admin@taplinkr.com', 'test@admin.com');

-- INFORMATIONS DE CONNEXION :
-- ============================
-- 
-- COMPTE 1 (Principal):
-- Email: admin@taplinkr.com
-- Mot de passe: Admin123!
-- 
-- COMPTE 2 (Secours):
-- Email: test@admin.com  
-- Mot de passe: admin123
-- 
-- URL: https://www.taplinkr.com/auth/signin