/*
  Warnings:

  - A unique constraint covering the columns `[path]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "webhook_path_key" ON "webhook"("path");
