-- DropForeignKey
ALTER TABLE "public"."execution" DROP CONSTRAINT "execution_workflowId_fkey";

-- DropForeignKey
ALTER TABLE "public"."webhook" DROP CONSTRAINT "webhook_workflowId_fkey";

-- AlterTable
ALTER TABLE "execution" ADD COLUMN     "secret" TEXT;

-- AddForeignKey
ALTER TABLE "webhook" ADD CONSTRAINT "webhook_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "execution" ADD CONSTRAINT "execution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;
