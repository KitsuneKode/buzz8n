/*
  Warnings:

  - You are about to drop the column `secret` on the `execution` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "execution" DROP COLUMN "secret";

-- AlterTable
ALTER TABLE "webhook" ADD COLUMN     "secret" TEXT;
