/*
  Warnings:

  - You are about to drop the `CronJobExecution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CronJobSchedule` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CronJobExecution" DROP CONSTRAINT "CronJobExecution_triggered_by_user_id_fkey";

-- DropTable
DROP TABLE "CronJobExecution";

-- DropTable
DROP TABLE "CronJobSchedule";
