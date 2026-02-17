-- Add reportedUserId column to Report table
ALTER TABLE "Report" ADD COLUMN "reportedUserId" TEXT;

-- Create index for reportedUserId
CREATE INDEX "Report_reportedUserId_idx" ON "Report"("reportedUserId");

-- Drop existing foreign key constraints if they exist
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_postId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_commentId_fkey";
ALTER TABLE "Report" DROP CONSTRAINT IF EXISTS "Report_userId_fkey";

-- Add foreign key constraint for reportedUserId with ON DELETE SET NULL
ALTER TABLE "Report" ADD CONSTRAINT "Report_reportedUserId_fkey" 
  FOREIGN KEY ("reportedUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Re-add foreign keys with ON DELETE SET NULL to make them optional
ALTER TABLE "Report" ADD CONSTRAINT "Report_postId_fkey" 
  FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Report" ADD CONSTRAINT "Report_commentId_fkey" 
  FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" 
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
