-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_CANCELLED';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_RESCHEDULED';
ALTER TYPE "NotificationType" ADD VALUE 'APPOINTMENT_REMINDER';
ALTER TYPE "NotificationType" ADD VALUE 'COINS_ADDED';
ALTER TYPE "NotificationType" ADD VALUE 'BADGE_EARNED';
ALTER TYPE "NotificationType" ADD VALUE 'CME_CREDITS_EARNED';
ALTER TYPE "NotificationType" ADD VALUE 'CONSULTATION_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'DOCTOR_RESPONSE';
ALTER TYPE "NotificationType" ADD VALUE 'REVIEW_REQUEST';
ALTER TYPE "NotificationType" ADD VALUE 'LICENSE_EXPIRY_WARNING';
