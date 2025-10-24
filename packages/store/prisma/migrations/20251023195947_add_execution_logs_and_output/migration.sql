-- CreateEnum
CREATE TYPE "ExecutionStatus" AS ENUM ('idle', 'started', 'success', 'error');

-- AlterTable
ALTER TABLE "execution" ADD COLUMN     "durationMs" INTEGER,
ADD COLUMN     "error" JSONB,
ADD COLUMN     "finishedAt" TIMESTAMP(3),
ADD COLUMN     "logs" JSONB[],
ADD COLUMN     "output" JSONB,
ADD COLUMN     "status" "ExecutionStatus" NOT NULL DEFAULT 'idle';

-- AlterTable
ALTER TABLE "workflow" ADD COLUMN     "status" "ExecutionStatus" NOT NULL DEFAULT 'idle';
