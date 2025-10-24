-- AlterTable
ALTER TABLE "execution" ADD COLUMN     "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "execution_workflowId_status_idx" ON "execution"("workflowId", "status");

-- CreateIndex
CREATE INDEX "execution_userId_createdAt_idx" ON "execution"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "execution_status_startedAt_idx" ON "execution"("status", "startedAt");
