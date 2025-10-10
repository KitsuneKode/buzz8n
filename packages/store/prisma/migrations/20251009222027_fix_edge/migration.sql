/*
  Warnings:

  - You are about to drop the column `connections` on the `workflow` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."workflow" DROP COLUMN "connections",
ADD COLUMN     "edges" JSONB[];
