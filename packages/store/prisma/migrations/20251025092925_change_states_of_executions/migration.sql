/*
  Warnings:

  - The values [idle,started] on the enum `ExecutionStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `error` on the `execution` table. All the data in the column will be lost.
  - You are about to drop the column `output` on the `execution` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExecutionStatus_new" AS ENUM ('initial', 'loading', 'success', 'error');
ALTER TABLE "public"."execution" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."workflow" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "workflow" ALTER COLUMN "status" TYPE "ExecutionStatus_new" USING ("status"::text::"ExecutionStatus_new");
ALTER TABLE "execution" ALTER COLUMN "status" TYPE "ExecutionStatus_new" USING ("status"::text::"ExecutionStatus_new");
ALTER TYPE "ExecutionStatus" RENAME TO "ExecutionStatus_old";
ALTER TYPE "ExecutionStatus_new" RENAME TO "ExecutionStatus";
DROP TYPE "public"."ExecutionStatus_old";
ALTER TABLE "execution" ALTER COLUMN "status" SET DEFAULT 'initial';
ALTER TABLE "workflow" ALTER COLUMN "status" SET DEFAULT 'initial';
COMMIT;

-- AlterTable
ALTER TABLE "execution" DROP COLUMN "error",
DROP COLUMN "output",
ADD COLUMN     "summary" TEXT,
ALTER COLUMN "status" SET DEFAULT 'initial';

-- AlterTable
ALTER TABLE "workflow" ALTER COLUMN "active" SET DEFAULT false,
ALTER COLUMN "status" SET DEFAULT 'initial';
