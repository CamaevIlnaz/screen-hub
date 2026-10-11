-- AlterTable
ALTER TABLE "version" ALTER COLUMN "version" TYPE INTEGER USING ("version"::integer);

-- CreateIndex
CREATE UNIQUE INDEX "version_frameId_version_key" ON "version"("frameId", "version");
