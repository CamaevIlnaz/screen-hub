-- AlterTable
ALTER TABLE "users" ADD COLUMN "name" TEXT;

UPDATE "users" SET "name" = "first_name";

ALTER TABLE "users" ALTER COLUMN "name" SET NOT NULL;

ALTER TABLE "users" DROP COLUMN "avatar_path",
DROP COLUMN "created_at",
DROP COLUMN "first_name",
DROP COLUMN "updated_at";
