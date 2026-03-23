-- Add new fields to DoctorPerformance table
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "totalPostsCommented" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "totalCommentsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "conversionCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "curedPatientCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "notYetCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "consultNewDoctorCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "portfolioScore" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "clinicVisitCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "DoctorPerformance" ADD COLUMN IF NOT EXISTS "postClinicCureCount" INTEGER NOT NULL DEFAULT 0;

-- Create indexes
CREATE INDEX IF NOT EXISTS "DoctorPerformance_curedPatientCount_idx" ON "DoctorPerformance"("curedPatientCount");
CREATE INDEX IF NOT EXISTS "DoctorPerformance_portfolioScore_idx" ON "DoctorPerformance"("portfolioScore");

-- Create CommentConversion tracking table
CREATE TABLE IF NOT EXISTS "CommentConversion" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "commentId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "patientId" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "profileVisited" BOOLEAN NOT NULL DEFAULT false,
  "messageClicked" BOOLEAN NOT NULL DEFAULT false,
  "visitedAt" TIMESTAMP(3),
  "messageClickedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommentConversion_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE,
  CONSTRAINT "CommentConversion_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "CommentConversion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "CommentConversion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "CommentConversion_commentId_idx" ON "CommentConversion"("commentId");
CREATE INDEX IF NOT EXISTS "CommentConversion_doctorId_idx" ON "CommentConversion"("doctorId");
CREATE INDEX IF NOT EXISTS "CommentConversion_patientId_idx" ON "CommentConversion"("patientId");
CREATE INDEX IF NOT EXISTS "CommentConversion_messageClicked_idx" ON "CommentConversion"("messageClicked");

-- Create PatientFeedback table for post-consultation tracking
CREATE TABLE IF NOT EXISTS "PatientFeedback" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "patientId" TEXT NOT NULL,
  "doctorId" TEXT NOT NULL,
  "conversationId" TEXT,
  "appointmentId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING', -- PENDING, CURED, NOT_YET, CONSULT_NEW_DOCTOR
  "feedbackCount" INTEGER NOT NULL DEFAULT 0,
  "lastFeedbackAt" TIMESTAMP(3),
  "curedAt" TIMESTAMP(3),
  "wasClinicVisit" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PatientFeedback_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PatientFeedback_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "PatientFeedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL,
  CONSTRAINT "PatientFeedback_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS "PatientFeedback_patientId_idx" ON "PatientFeedback"("patientId");
CREATE INDEX IF NOT EXISTS "PatientFeedback_doctorId_idx" ON "PatientFeedback"("doctorId");
CREATE INDEX IF NOT EXISTS "PatientFeedback_status_idx" ON "PatientFeedback"("status");
CREATE INDEX IF NOT EXISTS "PatientFeedback_lastFeedbackAt_idx" ON "PatientFeedback"("lastFeedbackAt");

-- Create CommunityActivity table for community insights
CREATE TABLE IF NOT EXISTS "CommunityActivity" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "communityId" TEXT NOT NULL,
  "activityTier" TEXT NOT NULL DEFAULT 'INACTIVE', -- HIGHLY_ACTIVE, MODERATELY_ACTIVE, INACTIVE
  "totalPosts" INTEGER NOT NULL DEFAULT 0,
  "totalComments" INTEGER NOT NULL DEFAULT 0,
  "totalMembers" INTEGER NOT NULL DEFAULT 0,
  "avgPostsPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "avgCommentsPerPost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lastActivityAt" TIMESTAMP(3),
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityActivity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "CommunityActivity_communityId_key" ON "CommunityActivity"("communityId");
CREATE INDEX IF NOT EXISTS "CommunityActivity_activityTier_idx" ON "CommunityActivity"("activityTier");
