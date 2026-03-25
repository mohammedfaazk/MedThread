-- Add EmergencyBroadcast table
CREATE TABLE IF NOT EXISTS "EmergencyBroadcast" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "type" TEXT NOT NULL DEFAULT 'SYSTEM',
    "targetAudience" TEXT NOT NULL DEFAULT 'ALL',
    "targetRegion" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX "EmergencyBroadcast_isActive_idx" ON "EmergencyBroadcast"("isActive");
CREATE INDEX "EmergencyBroadcast_priority_idx" ON "EmergencyBroadcast"("priority");
CREATE INDEX "EmergencyBroadcast_createdAt_idx" ON "EmergencyBroadcast"("createdAt");
