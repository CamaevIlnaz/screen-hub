-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('in_progress', 'success', 'error');

-- AlterTable
ALTER TABLE "section" ADD COLUMN     "syncStatus" "SyncStatus";
