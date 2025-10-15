/*
  Warnings:

  - You are about to drop the column `title` on the `webhook` table. All the data in the column will be lost.
  - You are about to drop the `Execution` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[workflowId]` on the table `webhook` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Execution" DROP CONSTRAINT "Execution_workflowId_fkey";

-- DropIndex
DROP INDEX "public"."webhook_method_path_key";

-- AlterTable
ALTER TABLE "webhook" DROP COLUMN "title";

-- DropTable
DROP TABLE "public"."Execution";

-- CreateTable
CREATE TABLE "execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "execution_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_workflowId_key" ON "webhook"("workflowId");

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
