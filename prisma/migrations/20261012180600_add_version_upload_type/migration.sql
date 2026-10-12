-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('manual', 'automatic');

-- AlterTable
ALTER TABLE "version" ADD COLUMN "uploadType" "UploadType" NOT NULL DEFAULT 'manual';
