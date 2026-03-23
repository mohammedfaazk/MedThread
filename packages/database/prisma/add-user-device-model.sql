-- Add UserDevice model for push notifications
-- Run this migration manually or add to schema.prisma

CREATE TABLE IF NOT EXISTS "UserDevice" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "fcmToken" TEXT NOT NULL UNIQUE,
  "deviceType" TEXT NOT NULL,
  "deviceName" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastUsed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "UserDevice_userId_idx" ON "UserDevice"("userId");
CREATE INDEX "UserDevice_fcmToken_idx" ON "UserDevice"("fcmToken");
CREATE INDEX "UserDevice_isActive_idx" ON "UserDevice"("isActive");
