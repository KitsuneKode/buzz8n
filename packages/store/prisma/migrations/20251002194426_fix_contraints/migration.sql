/*
  Warnings:

  - A unique constraint covering the columns `[title,archived]` on the table `credential` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."credential_title_key";

-- CreateIndex
CREATE UNIQUE INDEX "credential_title_archived_key" ON "public"."credential"("title", "archived");
