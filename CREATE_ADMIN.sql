-- Script pour créer un compte admin dans Supabase
-- 
-- INSTRUCTIONS SIMPLES :
-- 1. Allez dans votre projet Supabase
-- 2. Cliquez sur "SQL Editor" dans le menu à gauche
-- 3. Copiez-collez TOUT ce code
-- 4. Cliquez sur "Run" en bas à droite
-- 5. Votre compte admin sera créé !

-- Vérifier si l'utilisateur admin existe déjà
DO $$
BEGIN
  -- Si l'utilisateur admin@taplinkr.com existe, on le met à jour
  IF EXISTS (SELECT 1 FROM "User" WHERE email = 'admin@taplinkr.com') THEN
    UPDATE "User" 
    SET 
      password = '$2a$12$KIGhxdhfqEJG2gDQP3J4AeZxQ5iVdVxPQWEgchxvZvE6CyvWF1bxK', -- Password: Admin123!
      role = 'ADMIN',
      "emailVerified" = true,
      plan = 'premium',
      name = 'Administrateur',
      username = 'admin',
      "updatedAt" = CURRENT_TIMESTAMP
    WHERE email = 'admin@taplinkr.com';
    
    RAISE NOTICE 'Compte admin mis à jour avec succès !';
  ELSE
    -- Sinon on crée un nouveau compte admin
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
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    );
    
    RAISE NOTICE 'Compte admin créé avec succès !';
  END IF;
END $$;

-- Afficher le résultat
SELECT 'COMPTE ADMIN CRÉÉ !' as "Message",
       'admin@taplinkr.com' as "Email",
       'Admin123!' as "Mot de passe",
       'https://www.taplinkr.com/auth/signin' as "URL de connexion";