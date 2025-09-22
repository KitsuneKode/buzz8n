-- CreateEnum
CREATE TYPE "public"."Methods" AS ENUM ('POST', 'GET', 'PUT');

-- CreateEnum
CREATE TYPE "public"."SupportedPlatforms" AS ENUM ('Telegram', 'Gmail');

-- CreateTable
CREATE TABLE "public"."workflow" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "nodes" JSONB[],
    "connections" JSONB[],
    "userId" TEXT NOT NULL,

    CONSTRAINT "workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."webhook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "method" "public"."Methods" NOT NULL,
    "path" TEXT NOT NULL,

    CONSTRAINT "webhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."credential" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" "public"."SupportedPlatforms" NOT NULL,
    "data" JSONB NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "webhook_method_path_key" ON "public"."webhook"("method", "path");

-- CreateIndex
CREATE INDEX "credential_title_idx" ON "public"."credential"("title");

-- AddForeignKey
ALTER TABLE "public"."workflow" ADD CONSTRAINT "workflow_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."credential" ADD CONSTRAINT "credential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
