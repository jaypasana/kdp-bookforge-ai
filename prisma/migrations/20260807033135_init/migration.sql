-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookProjectStatus" AS ENUM ('SETUP', 'PLANNING', 'OUTLINE_GENERATION', 'AWAITING_OUTLINE_APPROVAL', 'GENERATING_CHAPTERS', 'QUALITY_REVIEW', 'GENERATING_KDP_PACKAGE', 'COMPILING_DOCX', 'READY_FOR_REVIEW', 'APPROVED', 'FAILED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "OutlineStatus" AS ENUM ('DRAFT', 'AWAITING_APPROVAL', 'APPROVED', 'SUPERSEDED');

-- CreateEnum
CREATE TYPE "ChapterStatus" AS ENUM ('PENDING', 'BRIEF_READY', 'DRAFTING', 'DRAFT_COMPLETE', 'REVIEWING', 'REVISING', 'APPROVED', 'FAILED');

-- CreateEnum
CREATE TYPE "SectionSourceType" AS ENUM ('AI_GENERATED', 'USER_EDITED', 'AI_REVISED', 'APPROVED');

-- CreateEnum
CREATE TYPE "QualityReviewType" AS ENUM ('CHAPTER', 'ORIGINALITY', 'FULL_MANUSCRIPT');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ExportType" AS ENUM ('MANUSCRIPT', 'KDP_PACKAGE', 'QUALITY_REPORT', 'PROJECT_ARCHIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" TIMESTAMP(3),
    "passwordHash" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "penName" TEXT,
    "shortBio" TEXT NOT NULL,
    "longBio" TEXT NOT NULL,
    "website" TEXT,
    "email" TEXT,
    "socialLinks" JSONB,
    "existingBooks" JSONB,
    "authorTagline" TEXT,
    "publisherName" TEXT,
    "copyrightHolder" TEXT,
    "defaultCTA" TEXT,
    "bonusResourceUrl" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookProject" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "authorProfileId" TEXT,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "slug" TEXT NOT NULL,
    "niche" TEXT,
    "targetAudience" TEXT,
    "bookType" TEXT,
    "language" TEXT NOT NULL DEFAULT 'English',
    "tone" TEXT,
    "pointOfView" TEXT,
    "targetWordCount" INTEGER NOT NULL DEFAULT 50000,
    "chapterCount" INTEGER NOT NULL DEFAULT 12,
    "wordsPerChapter" INTEGER NOT NULL DEFAULT 4000,
    "readingLevel" TEXT,
    "includeCaseStudies" BOOLEAN NOT NULL DEFAULT true,
    "includeExercises" BOOLEAN NOT NULL DEFAULT true,
    "includeWorksheets" BOOLEAN NOT NULL DEFAULT false,
    "includeReflection" BOOLEAN NOT NULL DEFAULT true,
    "includeChecklists" BOOLEAN NOT NULL DEFAULT true,
    "includeFAQs" BOOLEAN NOT NULL DEFAULT true,
    "includeGlossary" BOOLEAN NOT NULL DEFAULT false,
    "includeBonusResources" BOOLEAN NOT NULL DEFAULT true,
    "includeCitations" BOOLEAN NOT NULL DEFAULT false,
    "includeKdpPackage" BOOLEAN NOT NULL DEFAULT true,
    "status" "BookProjectStatus" NOT NULL DEFAULT 'SETUP',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "totalWords" INTEGER NOT NULL DEFAULT 0,
    "estimatedCost" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fullAutopilot" BOOLEAN NOT NULL DEFAULT false,
    "researchMode" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "BookProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookDiscovery" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "promptVersion" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BookDiscovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Outline" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "OutlineStatus" NOT NULL DEFAULT 'DRAFT',
    "structuredData" JSONB NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Outline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "chapterNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "brief" JSONB,
    "targetWordCount" INTEGER NOT NULL,
    "actualWordCount" INTEGER NOT NULL DEFAULT 0,
    "status" "ChapterStatus" NOT NULL DEFAULT 'PENDING',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "score" INTEGER,
    "revisionAttempts" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChapterSection" (
    "id" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "sectionOrder" INTEGER NOT NULL,
    "heading" TEXT,
    "content" TEXT NOT NULL,
    "sourceType" "SectionSourceType" NOT NULL DEFAULT 'AI_GENERATED',
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChapterSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BookBible" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "structuredData" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BookBible_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KdpPackage" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "titles" JSONB,
    "subtitles" JSONB,
    "description" JSONB,
    "keywords" JSONB,
    "categories" JSONB,
    "pricing" JSONB,
    "launchPlan" JSONB,
    "marketingPlan" JSONB,
    "emailSequence" JSONB,
    "socialContent" JSONB,
    "aPlusContent" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KdpPackage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualityReview" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "chapterId" TEXT,
    "reviewType" "QualityReviewType" NOT NULL,
    "score" INTEGER,
    "issues" JSONB,
    "recommendations" JSONB,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QualityReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationJob" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "jobType" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'QUEUED',
    "progress" INTEGER NOT NULL DEFAULT 0,
    "attempt" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "metadata" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookProjectId" TEXT,
    "taskType" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL,
    "outputTokens" INTEGER NOT NULL,
    "estimatedCost" DOUBLE PRECISION NOT NULL,
    "durationMs" INTEGER,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "responseId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ApiUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromptTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "systemPrompt" TEXT NOT NULL,
    "userPromptTemplate" TEXT NOT NULL,
    "outputSchema" JSONB,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Export" (
    "id" TEXT NOT NULL,
    "bookProjectId" TEXT NOT NULL,
    "exportType" "ExportType" NOT NULL,
    "fileName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Export_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Revision" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "content" JSONB NOT NULL,
    "source" "SectionSourceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSetting" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- CreateIndex
CREATE INDEX "AuthorProfile_userId_idx" ON "AuthorProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "BookProject_slug_key" ON "BookProject"("slug");

-- CreateIndex
CREATE INDEX "BookProject_userId_idx" ON "BookProject"("userId");

-- CreateIndex
CREATE INDEX "BookProject_status_idx" ON "BookProject"("status");

-- CreateIndex
CREATE INDEX "BookProject_createdAt_idx" ON "BookProject"("createdAt");

-- CreateIndex
CREATE INDEX "BookDiscovery_bookProjectId_idx" ON "BookDiscovery"("bookProjectId");

-- CreateIndex
CREATE INDEX "Outline_bookProjectId_idx" ON "Outline"("bookProjectId");

-- CreateIndex
CREATE INDEX "Outline_status_idx" ON "Outline"("status");

-- CreateIndex
CREATE INDEX "Chapter_bookProjectId_idx" ON "Chapter"("bookProjectId");

-- CreateIndex
CREATE INDEX "Chapter_chapterNumber_idx" ON "Chapter"("chapterNumber");

-- CreateIndex
CREATE INDEX "Chapter_status_idx" ON "Chapter"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookProjectId_chapterNumber_key" ON "Chapter"("bookProjectId", "chapterNumber");

-- CreateIndex
CREATE INDEX "ChapterSection_chapterId_idx" ON "ChapterSection"("chapterId");

-- CreateIndex
CREATE UNIQUE INDEX "BookBible_bookProjectId_key" ON "BookBible"("bookProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "KdpPackage_bookProjectId_key" ON "KdpPackage"("bookProjectId");

-- CreateIndex
CREATE INDEX "QualityReview_bookProjectId_idx" ON "QualityReview"("bookProjectId");

-- CreateIndex
CREATE INDEX "QualityReview_chapterId_idx" ON "QualityReview"("chapterId");

-- CreateIndex
CREATE INDEX "GenerationJob_bookProjectId_idx" ON "GenerationJob"("bookProjectId");

-- CreateIndex
CREATE INDEX "GenerationJob_jobType_idx" ON "GenerationJob"("jobType");

-- CreateIndex
CREATE INDEX "GenerationJob_status_idx" ON "GenerationJob"("status");

-- CreateIndex
CREATE INDEX "ApiUsage_userId_idx" ON "ApiUsage"("userId");

-- CreateIndex
CREATE INDEX "ApiUsage_bookProjectId_idx" ON "ApiUsage"("bookProjectId");

-- CreateIndex
CREATE INDEX "ApiUsage_createdAt_idx" ON "ApiUsage"("createdAt");

-- CreateIndex
CREATE INDEX "PromptTemplate_name_idx" ON "PromptTemplate"("name");

-- CreateIndex
CREATE UNIQUE INDEX "PromptTemplate_name_version_key" ON "PromptTemplate"("name", "version");

-- CreateIndex
CREATE INDEX "Export_bookProjectId_idx" ON "Export"("bookProjectId");

-- CreateIndex
CREATE INDEX "Revision_entityType_entityId_idx" ON "Revision"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthorProfile" ADD CONSTRAINT "AuthorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookProject" ADD CONSTRAINT "BookProject_authorProfileId_fkey" FOREIGN KEY ("authorProfileId") REFERENCES "AuthorProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookDiscovery" ADD CONSTRAINT "BookDiscovery_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Outline" ADD CONSTRAINT "Outline_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChapterSection" ADD CONSTRAINT "ChapterSection_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BookBible" ADD CONSTRAINT "BookBible_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KdpPackage" ADD CONSTRAINT "KdpPackage_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualityReview" ADD CONSTRAINT "QualityReview_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationJob" ADD CONSTRAINT "GenerationJob_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiUsage" ADD CONSTRAINT "ApiUsage_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Export" ADD CONSTRAINT "Export_bookProjectId_fkey" FOREIGN KEY ("bookProjectId") REFERENCES "BookProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
