-- Add AuditAction enum
CREATE TYPE "AuditAction" AS ENUM (
  'ADMIN_LOGIN',
  'ADMIN_LOGOUT',
  'USER_SUSPEND',
  'USER_UNSUSPEND',
  'USER_DELETE',
  'USER_UPDATE',
  'POST_DELETE',
  'POST_RESTORE',
  'POST_PIN',
  'POST_UNPIN',
  'POST_LOCK',
  'POST_UNLOCK',
  'COMMENT_DELETE',
  'COMMENT_RESTORE',
  'REPORT_RESOLVE',
  'REPORT_DISMISS',
  'DOCTOR_APPROVE',
  'DOCTOR_REJECT',
  'DOCTOR_SUSPEND',
  'SETTINGS_UPDATE',
  'ROLE_CHANGE'
);

-- Create AuditLog table
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

-- Create indexes
CREATE INDEX "AuditLog_adminId_idx" ON "AuditLog"("adminId");
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");

-- Add foreign key
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
