/*
  Warnings:

  - You are about to drop the column `enabled` on the `workflow` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `workflow` table. All the data in the column will be lost.
  - Added the required column `active` to the `workflow` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `workflow` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."workflow" DROP COLUMN "enabled",
DROP COLUMN "title",
ADD COLUMN     "active" BOOLEAN NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
