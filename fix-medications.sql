-- First, clear any invalid data
UPDATE "HealthProfile" SET "currentMedications" = NULL WHERE "currentMedications" IS NOT NULL AND "currentMedications" != '' AND "currentMedications" NOT LIKE '[%';

-- Then change the column type
ALTER TABLE "HealthProfile" ALTER COLUMN "currentMedications" TYPE JSONB USING 
  CASE 
    WHEN "currentMedications" IS NULL THEN NULL
    WHEN "currentMedications" = '' THEN NULL
    ELSE "currentMedications"::jsonb
  END;
