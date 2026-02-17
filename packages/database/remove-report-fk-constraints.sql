-- First, let's see what constraints exist
-- Run this to check: SELECT conname FROM pg_constraint WHERE conrelid = 'Report'::regclass;

-- Drop ALL foreign key constraints on Report table
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT conname 
              FROM pg_constraint 
              WHERE conrelid = '"Report"'::regclass 
              AND contype = 'f') 
    LOOP
        EXECUTE 'ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
    END LOOP;
END $$;

-- Verify constraints are dropped
-- Run this to verify: SELECT conname FROM pg_constraint WHERE conrelid = 'Report'::regclass;
