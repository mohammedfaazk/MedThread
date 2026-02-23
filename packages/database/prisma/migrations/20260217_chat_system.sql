-- Migration: Enhanced Chat System with Appointment Gating
-- Date: 2026-02-17

-- Add new fields to Conversation model
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "patient_id" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "doctor_id" TEXT;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "is_active" BOOLEAN DEFAULT true;
ALTER TABLE "Conversation" ADD COLUMN IF NOT EXISTS "last_message_at" TIMESTAMP(3);

-- Add new fields to Message model
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "is_edited" BOOLEAN DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "is_deleted" BOOLEAN DEFAULT false;
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "read_at" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "edited_at" TIMESTAMP(3);
ALTER TABLE "Message" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_conversation_appointment" ON "Conversation"("appointmentId");
CREATE INDEX IF NOT EXISTS "idx_conversation_patient" ON "Conversation"("patient_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_doctor" ON "Conversation"("doctor_id");
CREATE INDEX IF NOT EXISTS "idx_conversation_active" ON "Conversation"("is_active");

CREATE INDEX IF NOT EXISTS "idx_message_conversation_created" ON "Message"("conversationId", "createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_message_sender" ON "Message"("senderId");
CREATE INDEX IF NOT EXISTS "idx_message_read" ON "Message"("read_at");
CREATE INDEX IF NOT EXISTS "idx_message_deleted" ON "Message"("is_deleted");

-- Add foreign key constraints if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversation_patient'
    ) THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "fk_conversation_patient" 
        FOREIGN KEY ("patient_id") REFERENCES "User"("id") ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_conversation_doctor'
    ) THEN
        ALTER TABLE "Conversation" ADD CONSTRAINT "fk_conversation_doctor" 
        FOREIGN KEY ("doctor_id") REFERENCES "User"("id") ON DELETE SET NULL;
    END IF;
END $$;

-- Create typing indicators table
CREATE TABLE IF NOT EXISTS "TypingIndicator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_typing" BOOLEAN DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_typing_conversation" FOREIGN KEY ("conversation_id") 
        REFERENCES "Conversation"("id") ON DELETE CASCADE,
    CONSTRAINT "fk_typing_user" FOREIGN KEY ("user_id") 
        REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_typing_conversation" ON "TypingIndicator"("conversation_id");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_typing_unique" ON "TypingIndicator"("conversation_id", "user_id");

-- Create message rate limit tracking table
CREATE TABLE IF NOT EXISTS "MessageRateLimit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "message_count" INTEGER DEFAULT 1,
    "window_start" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "fk_rate_limit_user" FOREIGN KEY ("user_id") 
        REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "idx_rate_limit_user_window" ON "MessageRateLimit"("user_id", "window_start");
CREATE UNIQUE INDEX IF NOT EXISTS "idx_rate_limit_unique" ON "MessageRateLimit"("user_id", "conversation_id", "window_start");
