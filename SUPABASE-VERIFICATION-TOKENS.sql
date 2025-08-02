-- Table de tokens de vérification
CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- Index unique sur le token
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

-- Index sur userId pour améliorer les performances
CREATE INDEX IF NOT EXISTS "verification_tokens_userId_idx" ON "verification_tokens"("userId");

-- Foreign key vers la table users
ALTER TABLE "verification_tokens" 
ADD CONSTRAINT "verification_tokens_userId_fkey" 
FOREIGN KEY ("userId") 
REFERENCES "users"("id") 
ON DELETE CASCADE 
ON UPDATE CASCADE;