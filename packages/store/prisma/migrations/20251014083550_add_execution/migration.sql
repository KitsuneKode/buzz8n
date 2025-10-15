/*
  Warnings:

  - Added the required column `workflowId` to the `webhook` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "webhook" ADD COLUMN     "workflowId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Execution" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,

    CONSTRAINT "Execution_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Execution" ADD CONSTRAINT "Execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
