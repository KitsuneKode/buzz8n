/*
  Warnings:

  - The `data` column on the `credential` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."credential" DROP COLUMN "data",
ADD COLUMN     "data" JSONB[];
