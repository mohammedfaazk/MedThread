-- First, clean up invalid JSON data
UPDATE "HealthProfile" 
SET "currentMedications" = NULL 
WHERE "currentMedications" IS NOT NULL 
  AND "currentMedications"::text = '';

-- AlterTable
ALTER TABLE "HealthProfile" ALTER COLUMN "currentMedications" TYPE JSONB USING 
  CASE 
    WHEN "currentMedications" IS NULL THEN NULL
    WHEN "currentMedications"::text = '' THEN NULL
    ELSE 
      CASE 
        WHEN "currentMedications"::text ~ '^[\[\{]' THEN "currentMedications"::jsonb
        ELSE NULL
      END
  END;
