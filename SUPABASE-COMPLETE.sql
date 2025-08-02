-- Script complet pour initialiser toutes les tables TapLinkr dans Supabase
-- Mapping correct avec Prisma schema

-- Supprimer les tables existantes (dans le bon ordre pour les foreign keys)
DROP TABLE IF EXISTS "team_analytics" CASCADE;
DROP TABLE IF EXISTS "team_templates" CASCADE;
DROP TABLE IF EXISTS "team_invitations" CASCADE;
DROP TABLE IF EXISTS "teams" CASCADE;
DROP TABLE IF EXISTS "push_subscriptions" CASCADE;
DROP TABLE IF EXISTS "notification_preferences" CASCADE;
DROP TABLE IF EXISTS "notifications" CASCADE;
DROP TABLE IF EXISTS "custom_domains" CASCADE;
DROP TABLE IF EXISTS "scheduled_jobs" CASCADE;
DROP TABLE IF EXISTS "link_schedules" CASCADE;
DROP TABLE IF EXISTS "password_attempts" CASCADE;
DROP TABLE IF EXISTS "password_protections" CASCADE;
DROP TABLE IF EXISTS "user_themes" CASCADE;
DROP TABLE IF EXISTS "user_profiles" CASCADE;
DROP TABLE IF EXISTS "templates" CASCADE;
DROP TABLE IF EXISTS "analytics_summary" CASCADE;
DROP TABLE IF EXISTS "analytics_events" CASCADE;
DROP TABLE IF EXISTS "files" CASCADE;
DROP TABLE IF EXISTS "folders" CASCADE;
DROP TABLE IF EXISTS "clicks" CASCADE;
DROP TABLE IF EXISTS "multi_links" CASCADE;
DROP TABLE IF EXISTS "links" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;

-- Table users (mapped from User model)
CREATE TABLE "users" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "email" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "name" TEXT,
  "image" TEXT,
  "bio" TEXT,
  "bannerImage" TEXT,
  "role" TEXT NOT NULL DEFAULT 'user',
  "plan" TEXT NOT NULL DEFAULT 'free',
  "planExpiresAt" TIMESTAMP(3),
  "stripeCustomerId" TEXT,
  "stripeSubscriptionId" TEXT,
  "teamId" TEXT,
  "teamRole" TEXT DEFAULT 'member',
  "emailVerified" BOOLEAN NOT NULL DEFAULT false,
  "emailVerificationToken" TEXT,
  "emailVerificationExpiry" TIMESTAMP(3),
  "banned" BOOLEAN NOT NULL DEFAULT false,
  "bannedAt" TIMESTAMP(3),
  "bannedReason" TEXT,
  "theme" TEXT NOT NULL DEFAULT 'gradient',
  "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
  "secondaryColor" TEXT NOT NULL DEFAULT '#8b5cf6',
  "backgroundImage" TEXT,
  "avatarId" TEXT,
  "bannerId" TEXT,
  "twitterUrl" TEXT,
  "instagramUrl" TEXT,
  "linkedinUrl" TEXT,
  "youtubeUrl" TEXT,
  "tiktokUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Indexes for users
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");
CREATE UNIQUE INDEX "users_stripeCustomerId_key" ON "users"("stripeCustomerId");
CREATE UNIQUE INDEX "users_stripeSubscriptionId_key" ON "users"("stripeSubscriptionId");
CREATE UNIQUE INDEX "users_emailVerificationToken_key" ON "users"("emailVerificationToken");

-- Table links (mapped from Link model)
CREATE TABLE "links" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "coverImage" TEXT,
  "coverImagePosition" TEXT,
  "profileImage" TEXT,
  "coverId" TEXT,
  "fontFamily" TEXT,
  "borderRadius" TEXT,
  "backgroundColor" TEXT,
  "textColor" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "isDirect" BOOLEAN NOT NULL DEFAULT false,
  "directUrl" TEXT,
  "shieldEnabled" BOOLEAN NOT NULL DEFAULT false,
  "isUltraLink" BOOLEAN NOT NULL DEFAULT false,
  "shieldConfig" TEXT,
  "isOnline" BOOLEAN NOT NULL DEFAULT false,
  "city" TEXT,
  "country" TEXT,
  "instagramUrl" TEXT,
  "tiktokUrl" TEXT,
  "twitterUrl" TEXT,
  "youtubeUrl" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "folderId" TEXT,
  
  CONSTRAINT "links_pkey" PRIMARY KEY ("id")
);

-- Indexes for links
CREATE UNIQUE INDEX "links_slug_key" ON "links"("slug");

-- Table multi_links
CREATE TABLE "multi_links" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "parentLinkId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "description" TEXT,
  "icon" TEXT,
  "iconImage" TEXT,
  "animation" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "multi_links_pkey" PRIMARY KEY ("id")
);

-- Table clicks (mapped from Click model)
CREATE TABLE "clicks" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "referer" TEXT,
  "country" TEXT,
  "device" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "clicks_pkey" PRIMARY KEY ("id")
);

-- Table folders (mapped from Folder model)
CREATE TABLE "folders" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "color" TEXT,
  "icon" TEXT,
  "userId" TEXT NOT NULL,
  "parentId" TEXT,
  "order" INTEGER NOT NULL DEFAULT 0,
  "isExpanded" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "folders_pkey" PRIMARY KEY ("id")
);

-- Table files
CREATE TABLE "files" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "filename" TEXT NOT NULL,
  "originalName" TEXT NOT NULL,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "url" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- Table analytics_events (mapped from AnalyticsEvent model)
CREATE TABLE "analytics_events" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "eventType" TEXT NOT NULL,
  "ip" TEXT,
  "userAgent" TEXT,
  "referer" TEXT,
  "country" TEXT,
  "region" TEXT,
  "city" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "device" TEXT,
  "browser" TEXT,
  "os" TEXT,
  "utmSource" TEXT,
  "utmMedium" TEXT,
  "utmCampaign" TEXT,
  "utmTerm" TEXT,
  "utmContent" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- Indexes for analytics_events
CREATE INDEX "analytics_events_linkId_createdAt_idx" ON "analytics_events"("linkId", "createdAt");
CREATE INDEX "analytics_events_userId_createdAt_idx" ON "analytics_events"("userId", "createdAt");

-- Table analytics_summary
CREATE TABLE "analytics_summary" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "clicks" INTEGER NOT NULL DEFAULT 0,
  "views" INTEGER NOT NULL DEFAULT 0,
  "topCountry" TEXT,
  "topDevice" TEXT,
  "topBrowser" TEXT,
  "topReferer" TEXT,
  
  CONSTRAINT "analytics_summary_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for analytics_summary
CREATE UNIQUE INDEX "analytics_summary_linkId_date_key" ON "analytics_summary"("linkId", "date");

-- Table templates
CREATE TABLE "templates" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT NOT NULL,
  "layout" TEXT NOT NULL,
  "colors" TEXT NOT NULL,
  "fonts" TEXT NOT NULL,
  "spacing" TEXT NOT NULL,
  "animations" TEXT,
  "thumbnailId" TEXT,
  "cssCode" TEXT,
  "isPremium" BOOLEAN NOT NULL DEFAULT false,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "authorId" TEXT,
  "usageCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "templates_pkey" PRIMARY KEY ("id")
);

-- Table user_profiles
CREATE TABLE "user_profiles" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "templateId" TEXT,
  "customCSS" TEXT,
  "layout" TEXT,
  "seo" TEXT,
  "domain" TEXT,
  "favicon" TEXT,
  "analytics" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for user_profiles
CREATE UNIQUE INDEX "user_profiles_userId_key" ON "user_profiles"("userId");

-- Table user_themes
CREATE TABLE "user_themes" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "preference" TEXT NOT NULL DEFAULT 'system',
  "customTheme" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "user_themes_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for user_themes
CREATE UNIQUE INDEX "user_themes_userId_key" ON "user_themes"("userId");

-- Table password_protections
CREATE TABLE "password_protections" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "password" TEXT NOT NULL,
  "hint" TEXT,
  "maxAttempts" INTEGER NOT NULL DEFAULT 5,
  "lockoutDuration" INTEGER NOT NULL DEFAULT 3600,
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "lockedUntil" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "password_protections_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for password_protections
CREATE UNIQUE INDEX "password_protections_linkId_key" ON "password_protections"("linkId");

-- Table password_attempts
CREATE TABLE "password_attempts" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "ip" TEXT NOT NULL,
  "success" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "password_attempts_pkey" PRIMARY KEY ("id")
);

-- Index for password_attempts
CREATE INDEX "password_attempts_linkId_ip_createdAt_idx" ON "password_attempts"("linkId", "ip", "createdAt");

-- Table link_schedules
CREATE TABLE "link_schedules" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "linkId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "timezone" TEXT NOT NULL DEFAULT 'UTC',
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "recurrenceRule" TEXT,
  "actionOnStart" TEXT,
  "actionOnEnd" TEXT,
  "notifyStart" BOOLEAN NOT NULL DEFAULT false,
  "notifyEnd" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "link_schedules_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for link_schedules
CREATE UNIQUE INDEX "link_schedules_linkId_key" ON "link_schedules"("linkId");

-- Table scheduled_jobs
CREATE TABLE "scheduled_jobs" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "scheduleId" TEXT NOT NULL,
  "jobType" TEXT NOT NULL,
  "scheduledFor" TIMESTAMP(3) NOT NULL,
  "executed" BOOLEAN NOT NULL DEFAULT false,
  "executedAt" TIMESTAMP(3),
  "error" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "scheduled_jobs_pkey" PRIMARY KEY ("id")
);

-- Index for scheduled_jobs
CREATE INDEX "scheduled_jobs_scheduledFor_executed_idx" ON "scheduled_jobs"("scheduledFor", "executed");

-- Table custom_domains
CREATE TABLE "custom_domains" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "domain" TEXT NOT NULL,
  "subdomain" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "dnsRecords" TEXT,
  "sslEnabled" BOOLEAN NOT NULL DEFAULT false,
  "sslExpiry" TIMESTAMP(3),
  "redirectTo" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "custom_domains_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for custom_domains
CREATE UNIQUE INDEX "custom_domains_domain_key" ON "custom_domains"("domain");

-- Table notifications
CREATE TABLE "notifications" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "data" TEXT,
  "read" BOOLEAN NOT NULL DEFAULT false,
  "readAt" TIMESTAMP(3),
  "inApp" BOOLEAN NOT NULL DEFAULT true,
  "email" BOOLEAN NOT NULL DEFAULT false,
  "push" BOOLEAN NOT NULL DEFAULT false,
  "scheduledFor" TIMESTAMP(3),
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- Index for notifications
CREATE INDEX "notifications_userId_read_createdAt_idx" ON "notifications"("userId", "read", "createdAt");

-- Table notification_preferences
CREATE TABLE "notification_preferences" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "clickNotifications" BOOLEAN NOT NULL DEFAULT true,
  "scheduleNotifications" BOOLEAN NOT NULL DEFAULT true,
  "systemNotifications" BOOLEAN NOT NULL DEFAULT true,
  "marketingEmails" BOOLEAN NOT NULL DEFAULT false,
  "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
  "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
  "smsEnabled" BOOLEAN NOT NULL DEFAULT false,
  "digestFrequency" TEXT NOT NULL DEFAULT 'daily',
  "quietHours" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for notification_preferences
CREATE UNIQUE INDEX "notification_preferences_userId_key" ON "notification_preferences"("userId");

-- Table push_subscriptions
CREATE TABLE "push_subscriptions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL,
  "endpoint" TEXT NOT NULL,
  "keys" TEXT NOT NULL,
  "userAgent" TEXT,
  "deviceId" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for push_subscriptions
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- Table teams (mapped from Team model)
CREATE TABLE "teams" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "slug" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "maxMembers" INTEGER NOT NULL DEFAULT 5,
  "brandTheme" TEXT,
  "brandAssets" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

-- Unique constraints for teams
CREATE UNIQUE INDEX "teams_slug_key" ON "teams"("slug");
CREATE UNIQUE INDEX "teams_ownerId_key" ON "teams"("ownerId");

-- Table team_invitations (mapped from TeamInvitation model)
CREATE TABLE "team_invitations" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "teamId" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "token" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "invitedById" TEXT NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "acceptedAt" TIMESTAMP(3),
  
  CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id")
);

-- Unique constraints for team_invitations
CREATE UNIQUE INDEX "team_invitations_token_key" ON "team_invitations"("token");
CREATE UNIQUE INDEX "team_invitations_teamId_email_key" ON "team_invitations"("teamId", "email");

-- Table team_templates
CREATE TABLE "team_templates" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "teamId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "template" TEXT NOT NULL,
  "isApproved" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "team_templates_pkey" PRIMARY KEY ("id")
);

-- Table team_analytics
CREATE TABLE "team_analytics" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "teamId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "totalClicks" INTEGER NOT NULL DEFAULT 0,
  "totalViews" INTEGER NOT NULL DEFAULT 0,
  "members" INTEGER NOT NULL DEFAULT 0,
  "data" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT "team_analytics_pkey" PRIMARY KEY ("id")
);

-- Unique constraint for team_analytics
CREATE UNIQUE INDEX "team_analytics_teamId_date_key" ON "team_analytics"("teamId", "date");

-- Add all foreign key constraints
ALTER TABLE "links" ADD CONSTRAINT "links_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "links" ADD CONSTRAINT "links_coverId_fkey" FOREIGN KEY ("coverId") REFERENCES "files"("id") ON DELETE SET NULL;
ALTER TABLE "links" ADD CONSTRAINT "links_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "folders"("id") ON DELETE SET NULL;

ALTER TABLE "multi_links" ADD CONSTRAINT "multi_links_parentLinkId_fkey" FOREIGN KEY ("parentLinkId") REFERENCES "links"("id") ON DELETE CASCADE;

ALTER TABLE "clicks" ADD CONSTRAINT "clicks_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;
ALTER TABLE "clicks" ADD CONSTRAINT "clicks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "folders" ADD CONSTRAINT "folders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "folders" ADD CONSTRAINT "folders_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "folders"("id") ON DELETE CASCADE;

ALTER TABLE "files" ADD CONSTRAINT "files_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;
ALTER TABLE "analytics_events" ADD CONSTRAINT "analytics_events_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "analytics_summary" ADD CONSTRAINT "analytics_summary_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;
ALTER TABLE "analytics_summary" ADD CONSTRAINT "analytics_summary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "templates" ADD CONSTRAINT "templates_thumbnailId_fkey" FOREIGN KEY ("thumbnailId") REFERENCES "files"("id") ON DELETE SET NULL;
ALTER TABLE "templates" ADD CONSTRAINT "templates_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "templates"("id") ON DELETE SET NULL;

ALTER TABLE "user_themes" ADD CONSTRAINT "user_themes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "password_protections" ADD CONSTRAINT "password_protections_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;
ALTER TABLE "password_protections" ADD CONSTRAINT "password_protections_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "password_attempts" ADD CONSTRAINT "password_attempts_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;

ALTER TABLE "link_schedules" ADD CONSTRAINT "link_schedules_linkId_fkey" FOREIGN KEY ("linkId") REFERENCES "links"("id") ON DELETE CASCADE;
ALTER TABLE "link_schedules" ADD CONSTRAINT "link_schedules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "link_schedules"("id") ON DELETE CASCADE;

ALTER TABLE "custom_domains" ADD CONSTRAINT "custom_domains_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;

ALTER TABLE "users" ADD CONSTRAINT "users_avatarId_fkey" FOREIGN KEY ("avatarId") REFERENCES "files"("id") ON DELETE SET NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "files"("id") ON DELETE SET NULL;
ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL;

ALTER TABLE "teams" ADD CONSTRAINT "teams_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT;

ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "users"("id") ON DELETE RESTRICT;
ALTER TABLE "team_invitations" ADD CONSTRAINT "team_invitations_email_fkey" FOREIGN KEY ("email") REFERENCES "users"("email") ON DELETE SET NULL;

ALTER TABLE "team_templates" ADD CONSTRAINT "team_templates_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;

ALTER TABLE "team_analytics" ADD CONSTRAINT "team_analytics_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE CASCADE;

-- Créer un trigger pour mettre à jour updatedAt automatiquement
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Appliquer le trigger à toutes les tables avec updatedAt
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_links_updated_at BEFORE UPDATE ON "links" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_multi_links_updated_at BEFORE UPDATE ON "multi_links" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_folders_updated_at BEFORE UPDATE ON "folders" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON "files" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON "templates" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON "user_profiles" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_themes_updated_at BEFORE UPDATE ON "user_themes" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_password_protections_updated_at BEFORE UPDATE ON "password_protections" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_link_schedules_updated_at BEFORE UPDATE ON "link_schedules" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_custom_domains_updated_at BEFORE UPDATE ON "custom_domains" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON "notification_preferences" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON "teams" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_templates_updated_at BEFORE UPDATE ON "team_templates" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fin du script