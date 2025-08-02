-- Créer les tables pour TapLinkr

-- Table User
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "bio" TEXT,
  "bannerImage" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "plan" TEXT NOT NULL DEFAULT 'free',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerificationToken" TEXT,
  "emailVerificationExpiry" TIMESTAMP(3),
  "resetPasswordToken" TEXT,
  "resetPasswordExpiry" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "theme" TEXT DEFAULT 'gradient',
  "primaryColor" TEXT DEFAULT '#3b82f6',
  "secondaryColor" TEXT DEFAULT '#8b5cf6',
  "backgroundImage" TEXT,
  "backgroundGradient" TEXT,
  "backgroundColor" TEXT,
  "selectedThemeId" TEXT,
  "twitterUrl" TEXT,
  "instagramUrl" TEXT,
  "linkedinUrl" TEXT,
  "youtubeUrl" TEXT,
  "tiktokUrl" TEXT,
  "avatarId" TEXT,
  "bannerId" TEXT,
  "stripeCustomerId" TEXT,
  "stripePriceId" TEXT,
  "stripeCurrentPeriodEnd" TIMESTAMP(3),
  "teamId" TEXT,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- Indexes for User
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX IF NOT EXISTS "User_emailVerificationToken_key" ON "User"("emailVerificationToken");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetPasswordToken_key" ON "User"("resetPasswordToken");

-- Table Link (minimal pour commencer)
CREATE TABLE IF NOT EXISTS "Link" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "Link_pkey" PRIMARY KEY ("id")
);

-- Index for Link
CREATE UNIQUE INDEX IF NOT EXISTS "Link_slug_key" ON "Link"("slug");
CREATE INDEX IF NOT EXISTS "Link_userId_idx" ON "Link"("userId");

-- Foreign key
ALTER TABLE "Link" ADD CONSTRAINT "Link_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;