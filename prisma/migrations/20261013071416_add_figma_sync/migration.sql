-- AlterTable
ALTER TABLE "section" ADD COLUMN     "figmaSyncedAt" TIMESTAMP(3),
ADD COLUMN     "syncError" TEXT;

-- AlterTable
ALTER TABLE "version" ADD COLUMN     "contentHash" TEXT;

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);
