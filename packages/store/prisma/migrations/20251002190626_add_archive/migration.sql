-- AlterTable
ALTER TABLE "public"."credential" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."webhook" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "public"."workflow" ADD COLUMN     "archived" BOOLEAN NOT NULL DEFAULT false;
