-- DropForeignKey
ALTER TABLE "version" DROP CONSTRAINT "version_frameId_fkey";

-- DropForeignKey
ALTER TABLE "frame" DROP CONSTRAINT "frame_groupId_fkey";

-- DropForeignKey
ALTER TABLE "group" DROP CONSTRAINT "group_sectionId_fkey";

-- DropForeignKey
ALTER TABLE "section" DROP CONSTRAINT "section_projectId_fkey";

-- DropTable
DROP TABLE "version";

-- DropTable
DROP TABLE "frame";

-- DropTable
DROP TABLE "group";

-- DropTable
DROP TABLE "section";

-- DropTable
DROP TABLE "project";

-- CreateTable
CREATE TABLE "project" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "preview" TEXT,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "section" (
    "id" SERIAL NOT NULL,
    "projectId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "section_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "group" (
    "id" SERIAL NOT NULL,
    "sectionId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "frame" (
    "id" SERIAL NOT NULL,
    "groupId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "frame_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "version" (
    "id" SERIAL NOT NULL,
    "frameId" INTEGER NOT NULL,
    "version" TEXT NOT NULL,
    "description" TEXT,
    "filename" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "version_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "section_projectId_idx" ON "section"("projectId");

-- CreateIndex
CREATE INDEX "group_sectionId_idx" ON "group"("sectionId");

-- CreateIndex
CREATE INDEX "frame_groupId_idx" ON "frame"("groupId");

-- CreateIndex
CREATE INDEX "version_frameId_idx" ON "version"("frameId");

-- AddForeignKey
ALTER TABLE "section" ADD CONSTRAINT "section_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "group" ADD CONSTRAINT "group_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "section"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "frame" ADD CONSTRAINT "frame_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "version" ADD CONSTRAINT "version_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "frame"("id") ON DELETE CASCADE ON UPDATE CASCADE;
