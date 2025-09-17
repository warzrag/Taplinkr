# Session Version - À faire après résolution du problème d'authentification

## Problème actuel
L'implémentation du système de session version a causé la déconnexion de tous les utilisateurs car la colonne `sessionVersion` n'existe pas encore dans la base de données.

## Solution temporaire appliquée
Toutes les références à `sessionVersion` ont été commentées pour restaurer l'accès :
- `/lib/auth.ts` : Vérifications de session commentées
- `/types/next-auth.d.ts` : Type sessionVersion commenté
- `/app/api/teams/members/[id]/route.ts` : Incrémentation commentée

## Étapes pour réactiver le système

1. **Exécuter la migration SQL** (fichier : `add-session-version-migration.sql`)
   - Se connecter à Supabase
   - Aller dans SQL Editor
   - Exécuter le script de migration

2. **Réactiver le code**
   - Dans `/lib/auth.ts` : Décommenter toutes les lignes avec "sessionVersion"
   - Dans `/types/next-auth.d.ts` : Décommenter la ligne sessionVersion
   - Dans `/app/api/teams/members/[id]/route.ts` : Décommenter l'incrémentation

3. **Tester**
   - Vérifier que les utilisateurs peuvent toujours se connecter
   - Tester le retrait d'un membre d'équipe
   - Vérifier que le membre retiré est bien déconnecté

## Fonctionnalité
Une fois activé, ce système permettra de :
- Déconnecter automatiquement les membres retirés d'une équipe
- Invalider les sessions en cas de changement de sécurité
- Forcer la reconnexion après des actions administratives