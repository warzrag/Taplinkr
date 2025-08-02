# Exécution du script SQL dans Supabase

## Instructions

1. **Allez dans Supabase SQL Editor** :
   - https://supabase.com/dashboard/project/dkwgorynhgnmldzbhhrb/sql/new

2. **Copiez et collez le contenu de** `SUPABASE-COMPLETE.sql`

3. **Exécutez le script** (bouton Run)

4. **Vérifiez que toutes les tables sont créées** :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

   Vous devriez voir :
   - analytics_events
   - analytics_summary
   - clicks
   - custom_domains
   - files
   - folders
   - link_schedules
   - links
   - multi_links
   - notification_preferences
   - notifications
   - password_attempts
   - password_protections
   - push_subscriptions
   - scheduled_jobs
   - team_analytics
   - team_invitations
   - team_templates
   - teams
   - templates
   - user_profiles
   - user_themes
   - users

5. **Testez la création de compte** sur https://www.taplinkr.com/auth/signup

## Notes importantes

- Le script supprime d'abord toutes les tables existantes (DROP TABLE IF EXISTS)
- Il recrée toutes les tables avec le bon mapping (minuscules)
- Les foreign keys sont ajoutées à la fin pour éviter les erreurs de dépendances
- Les triggers pour updatedAt sont configurés automatiquement