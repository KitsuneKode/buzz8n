/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `credential` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "credential_title_key" ON "public"."credential"("title");
