-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('ADMIN_LOGIN', 'ADMIN_LOGOUT', 'USER_SUSPEND', 'USER_UNSUSPEND', 'USER_DELETE', 'USER_UPDATE', 'POST_DELETE', 'POST_RESTORE', 'POST_PIN', 'POST_UNPIN', 'POST_LOCK', 'POST_UNLOCK', 'COMMENT_DELETE', 'COMMENT_RESTORE', 'REPORT_RESOLVE', 'REPORT_DISMISS', 'DOCTOR_APPROVE', 'DOCTOR_REJECT', 'DOCTOR_SUSPEND', 'SETTINGS_UPDATE', 'ROLE_CHANGE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('CONSULTATION', 'SUBSCRIPTION', 'PREMIUM_FEATURE');

-- CreateEnum
CREATE TYPE "RefundStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "endorsementCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "graduationYear" INTEGER,
ADD COLUMN     "medicalUniversity" TEXT,
ADD COLUMN     "pincode" TEXT;

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" "AuditAction" NOT NULL,
    "adminId" TEXT NOT NULL,
    "targetType" TEXT,
    "targetId" TEXT,
    "details" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "properties" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "page" TEXT,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultationFee" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "patientId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "paymentId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultationFee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversionEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "conversionType" TEXT NOT NULL,
    "value" DECIMAL(10,2),
    "metadata" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversionEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "title" TEXT,
    "referrer" TEXT,
    "duration" INTEGER,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "type" "PaymentType" NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeChargeId" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentHistory" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "amount" DECIMAL(10,2),
    "status" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostAnalytics" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "views" INTEGER DEFAULT 0,
    "uniqueViews" INTEGER DEFAULT 0,
    "clicks" INTEGER DEFAULT 0,
    "shares" INTEGER DEFAULT 0,
    "avgTimeSpent" INTEGER DEFAULT 0,
    "bounceRate" DECIMAL(5,2) DEFAULT 0,
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "RefundStatus" NOT NULL DEFAULT 'PENDING',
    "stripeRefundId" TEXT,
    "processedAt" TIMESTAMP(3),
    "processedBy" TEXT,
    "adminNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "planPrice" DECIMAL(10,2) NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeSubscriptionId" TEXT,
    "stripeCustomerId" TEXT,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAnalytics" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "totalSessions" INTEGER DEFAULT 0,
    "totalPageViews" INTEGER DEFAULT 0,
    "totalTimeSpent" INTEGER DEFAULT 0,
    "postsCreated" INTEGER DEFAULT 0,
    "commentsCreated" INTEGER DEFAULT 0,
    "lastActive" TIMESTAMP(3),
    "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "startTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "pageViews" INTEGER DEFAULT 0,
    "events" INTEGER DEFAULT 0,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "device" TEXT,
    "browser" TEXT,
    "os" TEXT,

    CONSTRAINT "UserSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SymptomReport" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "postId" TEXT,
    "symptoms" JSONB NOT NULL,
    "detectedSymptoms" JSONB,
    "location" JSONB,
    "pincode" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "country" TEXT DEFAULT 'India',
    "age" INTEGER,
    "gender" TEXT,
    "temperature" DOUBLE PRECISION,
    "duration" TEXT,
    "severity" TEXT,
    "metadata" JSONB,
    "reportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SymptomReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthTrend" (
    "id" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "count" INTEGER NOT NULL,
    "region" TEXT,
    "severity" TEXT,
    "trendDirection" TEXT,
    "percentChange" DOUBLE PRECISION,
    "timeWindow" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "HealthTrend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorPerformance" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "totalResponses" INTEGER NOT NULL DEFAULT 0,
    "totalPatientsHelped" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "helpfulnessScore" DOUBLE PRECISION,
    "totalRatings" INTEGER NOT NULL DEFAULT 0,
    "appointmentsCompleted" INTEGER NOT NULL DEFAULT 0,
    "appointmentsCancelled" INTEGER NOT NULL DEFAULT 0,
    "activeEngagementScore" DOUBLE PRECISION,
    "lastActiveAt" TIMESTAMP(3),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "totalPostsCommented" INTEGER NOT NULL DEFAULT 0,
    "totalCommentsCount" INTEGER NOT NULL DEFAULT 0,
    "conversionCount" INTEGER NOT NULL DEFAULT 0,
    "curedPatientCount" INTEGER NOT NULL DEFAULT 0,
    "notYetCount" INTEGER NOT NULL DEFAULT 0,
    "consultNewDoctorCount" INTEGER NOT NULL DEFAULT 0,
    "portfolioScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "clinicVisitCount" INTEGER NOT NULL DEFAULT 0,
    "postClinicCureCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "DoctorPerformance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientOutcome" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT,
    "threadId" TEXT,
    "appointmentId" TEXT,
    "initialSymptoms" JSONB NOT NULL,
    "outcome" TEXT NOT NULL,
    "recoveryTime" INTEGER,
    "followUpCount" INTEGER NOT NULL DEFAULT 0,
    "satisfactionScore" DOUBLE PRECISION,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "PatientOutcome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformMetrics" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalUsers" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "newUsers" INTEGER NOT NULL DEFAULT 0,
    "totalDoctors" INTEGER NOT NULL DEFAULT 0,
    "activeDoctors" INTEGER NOT NULL DEFAULT 0,
    "newDoctors" INTEGER NOT NULL DEFAULT 0,
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalAppointments" INTEGER NOT NULL DEFAULT 0,
    "totalSymptomReports" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" INTEGER,
    "peakUsageHour" INTEGER,
    "userRetentionRate" DOUBLE PRECISION,
    "doctorRetentionRate" DOUBLE PRECISION,
    "metadata" JSONB,

    CONSTRAINT "PlatformMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeographicHealthData" (
    "id" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "topSymptoms" JSONB NOT NULL,
    "totalReports" INTEGER NOT NULL DEFAULT 0,
    "alertLevel" TEXT,
    "trendingIssues" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "GeographicHealthData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorRating" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "appointmentId" TEXT,
    "threadId" TEXT,
    "rating" DOUBLE PRECISION NOT NULL,
    "helpfulness" INTEGER,
    "communication" INTEGER,
    "expertise" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorRating_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResearchDataset" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "dataType" TEXT NOT NULL,
    "filters" JSONB,
    "recordCount" INTEGER NOT NULL DEFAULT 0,
    "anonymized" BOOLEAN NOT NULL DEFAULT true,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "exportedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,

    CONSTRAINT "ResearchDataset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommentConversion" (
    "id" TEXT NOT NULL,
    "commentId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "profileVisited" BOOLEAN NOT NULL DEFAULT false,
    "messageClicked" BOOLEAN NOT NULL DEFAULT false,
    "visitedAt" TIMESTAMP(3),
    "messageClickedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommentConversion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientFeedback" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "conversationId" TEXT,
    "appointmentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "feedbackCount" INTEGER NOT NULL DEFAULT 0,
    "lastFeedbackAt" TIMESTAMP(3),
    "curedAt" TIMESTAMP(3),
    "wasClinicVisit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityActivity" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "activityTier" TEXT NOT NULL DEFAULT 'INACTIVE',
    "totalPosts" INTEGER NOT NULL DEFAULT 0,
    "totalComments" INTEGER NOT NULL DEFAULT 0,
    "totalMembers" INTEGER NOT NULL DEFAULT 0,
    "avgPostsPerDay" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgCommentsPerPost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lastActivityAt" TIMESTAMP(3),
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorActivityMetrics" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "totalPatientsAcquired" INTEGER NOT NULL DEFAULT 0,
    "avgReplyTimeHours" DOUBLE PRECISION,
    "lastActiveAt" TIMESTAMP(3),
    "dailyActivityPattern" JSONB,
    "weeklyActivityPattern" JSONB,
    "monthlyGrowth" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoctorActivityMetrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserActivityLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "metadata" JSONB,
    "hourOfDay" INTEGER NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostPriority" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "priorityLevel" TEXT NOT NULL,
    "urgencyScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "detectedSymptoms" JSONB,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PostPriority_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientHealthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageGroup" TEXT,
    "biologicalSex" TEXT,
    "bloodGroup" TEXT,
    "preExistingConditions" JSONB,
    "currentMedications" JSONB,
    "allergies" JSONB,
    "smokingStatus" TEXT,
    "alcoholConsumption" TEXT,
    "activityLevel" TEXT,
    "sleepHours" TEXT,
    "primaryHealthConcern" TEXT,
    "secondaryHealthConcerns" JSONB,
    "completedAt" TIMESTAMP(3),
    "lastUpdatedAt" TIMESTAMP(3),
    "consentForDoctorView" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PatientHealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GeographicHealthTrend" (
    "id" TEXT NOT NULL,
    "symptom" TEXT NOT NULL,
    "pincode" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'India',
    "reportCount" INTEGER NOT NULL DEFAULT 1,
    "severity" TEXT,
    "timeWindow" TEXT NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GeographicHealthTrend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HealthProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "ageGroup" TEXT,
    "biologicalSex" TEXT,
    "nationality" TEXT,
    "weightRange" TEXT,
    "heightRange" TEXT,
    "activityLevel" TEXT,
    "medicalConditions" JSONB,
    "currentMedications" TEXT,
    "foodAllergies" JSONB,
    "dietType" TEXT,
    "religiousRestrictions" TEXT,
    "foodsToAvoid" TEXT,
    "cookingAccess" TEXT,
    "primaryGoal" TEXT,
    "sleepHours" TEXT,
    "waterIntake" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HealthProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DietPlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "healthProfileId" TEXT NOT NULL,
    "dailyCalorieGoal" INTEGER NOT NULL,
    "planData" JSONB NOT NULL,
    "nutritionalInfo" JSONB NOT NULL,
    "dietaryNote" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "savedAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DietPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoctorEndorsement" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DoctorEndorsement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_eventName_idx" ON "AnalyticsEvent"("eventName");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_sessionId_idx" ON "AnalyticsEvent"("sessionId");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_timestamp_idx" ON "AnalyticsEvent"("timestamp");

-- CreateIndex
CREATE INDEX "AnalyticsEvent_userId_idx" ON "AnalyticsEvent"("userId");

-- CreateIndex
CREATE INDEX "ConsultationFee_doctorId_idx" ON "ConsultationFee"("doctorId");

-- CreateIndex
CREATE INDEX "ConsultationFee_patientId_idx" ON "ConsultationFee"("patientId");

-- CreateIndex
CREATE INDEX "ConsultationFee_paymentId_idx" ON "ConsultationFee"("paymentId");

-- CreateIndex
CREATE INDEX "ConsultationFee_status_idx" ON "ConsultationFee"("status");

-- CreateIndex
CREATE INDEX "ConversionEvent_conversionType_idx" ON "ConversionEvent"("conversionType");

-- CreateIndex
CREATE INDEX "ConversionEvent_timestamp_idx" ON "ConversionEvent"("timestamp");

-- CreateIndex
CREATE INDEX "ConversionEvent_userId_idx" ON "ConversionEvent"("userId");

-- CreateIndex
CREATE INDEX "PageView_sessionId_idx" ON "PageView"("sessionId");

-- CreateIndex
CREATE INDEX "PageView_timestamp_idx" ON "PageView"("timestamp");

-- CreateIndex
CREATE INDEX "PageView_userId_idx" ON "PageView"("userId");

-- CreateIndex
CREATE INDEX "Payment_createdAt_idx" ON "Payment"("createdAt");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_stripePaymentIntentId_idx" ON "Payment"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "Payment_type_idx" ON "Payment"("type");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "PaymentHistory_createdAt_idx" ON "PaymentHistory"("createdAt");

-- CreateIndex
CREATE INDEX "PaymentHistory_paymentId_idx" ON "PaymentHistory"("paymentId");

-- CreateIndex
CREATE INDEX "PaymentHistory_userId_idx" ON "PaymentHistory"("userId");

-- CreateIndex
CREATE INDEX "PostAnalytics_postId_idx" ON "PostAnalytics"("postId");

-- CreateIndex
CREATE INDEX "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX "Refund_status_idx" ON "Refund"("status");

-- CreateIndex
CREATE INDEX "Refund_userId_idx" ON "Refund"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_stripeSubscriptionId_idx" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserAnalytics_userId_key" ON "UserAnalytics"("userId");

-- CreateIndex
CREATE INDEX "UserSession_startTime_idx" ON "UserSession"("startTime");

-- CreateIndex
CREATE INDEX "UserSession_userId_idx" ON "UserSession"("userId");

-- CreateIndex
CREATE INDEX "SymptomReport_createdAt_idx" ON "SymptomReport"("createdAt");

-- CreateIndex
CREATE INDEX "SymptomReport_sessionId_idx" ON "SymptomReport"("sessionId");

-- CreateIndex
CREATE INDEX "SymptomReport_pincode_idx" ON "SymptomReport"("pincode");

-- CreateIndex
CREATE INDEX "SymptomReport_city_idx" ON "SymptomReport"("city");

-- CreateIndex
CREATE INDEX "SymptomReport_district_idx" ON "SymptomReport"("district");

-- CreateIndex
CREATE INDEX "SymptomReport_state_idx" ON "SymptomReport"("state");

-- CreateIndex
CREATE INDEX "SymptomReport_reportedAt_idx" ON "SymptomReport"("reportedAt");

-- CreateIndex
CREATE INDEX "SymptomReport_severity_idx" ON "SymptomReport"("severity");

-- CreateIndex
CREATE INDEX "HealthTrend_symptom_idx" ON "HealthTrend"("symptom");

-- CreateIndex
CREATE INDEX "HealthTrend_region_idx" ON "HealthTrend"("region");

-- CreateIndex
CREATE INDEX "HealthTrend_calculatedAt_idx" ON "HealthTrend"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorPerformance_doctorId_key" ON "DoctorPerformance"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorPerformance_doctorId_idx" ON "DoctorPerformance"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorPerformance_helpfulnessScore_idx" ON "DoctorPerformance"("helpfulnessScore");

-- CreateIndex
CREATE INDEX "DoctorPerformance_activeEngagementScore_idx" ON "DoctorPerformance"("activeEngagementScore");

-- CreateIndex
CREATE INDEX "DoctorPerformance_curedPatientCount_idx" ON "DoctorPerformance"("curedPatientCount");

-- CreateIndex
CREATE INDEX "DoctorPerformance_portfolioScore_idx" ON "DoctorPerformance"("portfolioScore");

-- CreateIndex
CREATE INDEX "PatientOutcome_patientId_idx" ON "PatientOutcome"("patientId");

-- CreateIndex
CREATE INDEX "PatientOutcome_doctorId_idx" ON "PatientOutcome"("doctorId");

-- CreateIndex
CREATE INDEX "PatientOutcome_outcome_idx" ON "PatientOutcome"("outcome");

-- CreateIndex
CREATE INDEX "PatientOutcome_createdAt_idx" ON "PatientOutcome"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PlatformMetrics_date_key" ON "PlatformMetrics"("date");

-- CreateIndex
CREATE INDEX "PlatformMetrics_date_idx" ON "PlatformMetrics"("date");

-- CreateIndex
CREATE INDEX "GeographicHealthData_region_idx" ON "GeographicHealthData"("region");

-- CreateIndex
CREATE INDEX "GeographicHealthData_alertLevel_idx" ON "GeographicHealthData"("alertLevel");

-- CreateIndex
CREATE INDEX "GeographicHealthData_calculatedAt_idx" ON "GeographicHealthData"("calculatedAt");

-- CreateIndex
CREATE INDEX "DoctorRating_doctorId_idx" ON "DoctorRating"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorRating_patientId_idx" ON "DoctorRating"("patientId");

-- CreateIndex
CREATE INDEX "DoctorRating_createdAt_idx" ON "DoctorRating"("createdAt");

-- CreateIndex
CREATE INDEX "ResearchDataset_status_idx" ON "ResearchDataset"("status");

-- CreateIndex
CREATE INDEX "ResearchDataset_dataType_idx" ON "ResearchDataset"("dataType");

-- CreateIndex
CREATE INDEX "ResearchDataset_createdAt_idx" ON "ResearchDataset"("createdAt");

-- CreateIndex
CREATE INDEX "CommentConversion_commentId_idx" ON "CommentConversion"("commentId");

-- CreateIndex
CREATE INDEX "CommentConversion_doctorId_idx" ON "CommentConversion"("doctorId");

-- CreateIndex
CREATE INDEX "CommentConversion_patientId_idx" ON "CommentConversion"("patientId");

-- CreateIndex
CREATE INDEX "CommentConversion_messageClicked_idx" ON "CommentConversion"("messageClicked");

-- CreateIndex
CREATE INDEX "PatientFeedback_patientId_idx" ON "PatientFeedback"("patientId");

-- CreateIndex
CREATE INDEX "PatientFeedback_doctorId_idx" ON "PatientFeedback"("doctorId");

-- CreateIndex
CREATE INDEX "PatientFeedback_status_idx" ON "PatientFeedback"("status");

-- CreateIndex
CREATE INDEX "PatientFeedback_lastFeedbackAt_idx" ON "PatientFeedback"("lastFeedbackAt");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityActivity_communityId_key" ON "CommunityActivity"("communityId");

-- CreateIndex
CREATE INDEX "CommunityActivity_activityTier_idx" ON "CommunityActivity"("activityTier");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorActivityMetrics_doctorId_key" ON "DoctorActivityMetrics"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorActivityMetrics_doctorId_idx" ON "DoctorActivityMetrics"("doctorId");

-- CreateIndex
CREATE INDEX "DoctorActivityMetrics_lastActiveAt_idx" ON "DoctorActivityMetrics"("lastActiveAt");

-- CreateIndex
CREATE INDEX "UserActivityLog_userId_idx" ON "UserActivityLog"("userId");

-- CreateIndex
CREATE INDEX "UserActivityLog_activityType_idx" ON "UserActivityLog"("activityType");

-- CreateIndex
CREATE INDEX "UserActivityLog_createdAt_idx" ON "UserActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "UserActivityLog_hourOfDay_idx" ON "UserActivityLog"("hourOfDay");

-- CreateIndex
CREATE INDEX "UserActivityLog_dayOfWeek_idx" ON "UserActivityLog"("dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "PostPriority_postId_key" ON "PostPriority"("postId");

-- CreateIndex
CREATE INDEX "PostPriority_priorityLevel_idx" ON "PostPriority"("priorityLevel");

-- CreateIndex
CREATE INDEX "PostPriority_urgencyScore_idx" ON "PostPriority"("urgencyScore");

-- CreateIndex
CREATE UNIQUE INDEX "PatientHealthProfile_userId_key" ON "PatientHealthProfile"("userId");

-- CreateIndex
CREATE INDEX "PatientHealthProfile_userId_idx" ON "PatientHealthProfile"("userId");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_symptom_idx" ON "GeographicHealthTrend"("symptom");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_pincode_idx" ON "GeographicHealthTrend"("pincode");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_city_idx" ON "GeographicHealthTrend"("city");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_district_idx" ON "GeographicHealthTrend"("district");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_state_idx" ON "GeographicHealthTrend"("state");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_timeWindow_idx" ON "GeographicHealthTrend"("timeWindow");

-- CreateIndex
CREATE INDEX "GeographicHealthTrend_calculatedAt_idx" ON "GeographicHealthTrend"("calculatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "HealthProfile_userId_key" ON "HealthProfile"("userId");

-- CreateIndex
CREATE INDEX "HealthProfile_userId_idx" ON "HealthProfile"("userId");

-- CreateIndex
CREATE INDEX "DietPlan_userId_idx" ON "DietPlan"("userId");

-- CreateIndex
CREATE INDEX "DietPlan_healthProfileId_idx" ON "DietPlan"("healthProfileId");

-- CreateIndex
CREATE INDEX "DietPlan_generatedAt_idx" ON "DietPlan"("generatedAt");

-- CreateIndex
CREATE INDEX "DoctorEndorsement_postId_idx" ON "DoctorEndorsement"("postId");

-- CreateIndex
CREATE INDEX "DoctorEndorsement_doctorId_idx" ON "DoctorEndorsement"("doctorId");

-- CreateIndex
CREATE UNIQUE INDEX "DoctorEndorsement_postId_doctorId_key" ON "DoctorEndorsement"("postId", "doctorId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationFee" ADD CONSTRAINT "ConsultationFee_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationFee" ADD CONSTRAINT "ConsultationFee_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsultationFee" ADD CONSTRAINT "ConsultationFee_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversionEvent" ADD CONSTRAINT "ConversionEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageView" ADD CONSTRAINT "PageView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentHistory" ADD CONSTRAINT "PaymentHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostAnalytics" ADD CONSTRAINT "PostAnalytics_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAnalytics" ADD CONSTRAINT "UserAnalytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSession" ADD CONSTRAINT "UserSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomReport" ADD CONSTRAINT "SymptomReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SymptomReport" ADD CONSTRAINT "SymptomReport_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentConversion" ADD CONSTRAINT "CommentConversion_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentConversion" ADD CONSTRAINT "CommentConversion_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentConversion" ADD CONSTRAINT "CommentConversion_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommentConversion" ADD CONSTRAINT "CommentConversion_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientFeedback" ADD CONSTRAINT "PatientFeedback_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityActivity" ADD CONSTRAINT "CommunityActivity_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorActivityMetrics" ADD CONSTRAINT "DoctorActivityMetrics_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserActivityLog" ADD CONSTRAINT "UserActivityLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostPriority" ADD CONSTRAINT "PostPriority_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientHealthProfile" ADD CONSTRAINT "PatientHealthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HealthProfile" ADD CONSTRAINT "HealthProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DietPlan" ADD CONSTRAINT "DietPlan_healthProfileId_fkey" FOREIGN KEY ("healthProfileId") REFERENCES "HealthProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorEndorsement" ADD CONSTRAINT "DoctorEndorsement_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoctorEndorsement" ADD CONSTRAINT "DoctorEndorsement_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
