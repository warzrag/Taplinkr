-- Ajout des colonnes pour le partage de liens en équipe
ALTER TABLE "links"
ADD COLUMN IF NOT EXISTS "teamShared" BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "teamId" TEXT,
ADD COLUMN IF NOT EXISTS "originalOwnerId" TEXT,
ADD COLUMN IF NOT EXISTS "lastModifiedBy" TEXT;

-- Créer la table d'historique des liens d'équipe
CREATE TABLE IF NOT EXISTS "team_link_history" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "linkId" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "changes" JSONB,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE,
  FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id")
);

-- Créer la table d'audit
CREATE TABLE IF NOT EXISTS "team_audit_logs" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "teamId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "linkId" TEXT,
  "action" TEXT NOT NULL,
  "details" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "severity" TEXT DEFAULT 'info' NOT NULL,
  "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE,
  FOREIGN KEY ("userId") REFERENCES "users"("id"),
  FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE SET NULL
);

-- Créer les index
CREATE INDEX IF NOT EXISTS "idx_links_team" ON "links"("teamId", "teamShared");
CREATE INDEX IF NOT EXISTS "idx_team_link_history_team" ON "team_link_history"("teamId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_team_link_history_link" ON "team_link_history"("linkId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_team_audit_logs_team" ON "team_audit_logs"("teamId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_team_audit_logs_user" ON "team_audit_logs"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "idx_team_audit_logs_severity" ON "team_audit_logs"("severity", "createdAt");

-- Ajouter les foreign keys pour les nouvelles colonnes de links
ALTER TABLE "links"
ADD CONSTRAINT "fk_links_team" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL,
ADD CONSTRAINT "fk_links_original_owner" FOREIGN KEY ("originalOwnerId") REFERENCES "users"("id") ON DELETE SET NULL,
ADD CONSTRAINT "fk_links_last_modifier" FOREIGN KEY ("lastModifiedBy") REFERENCES "users"("id") ON DELETE SET NULL;