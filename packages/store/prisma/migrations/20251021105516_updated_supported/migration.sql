/*
  Warnings:

  - The values [Gmail,Slack,Discord,Resend,Anthropic] on the enum `SupportedPlatforms` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SupportedPlatforms_new" AS ENUM ('Telegram', 'Email', 'OpenAI', 'Gemini', 'Anthropic');
ALTER TABLE "credential" ALTER COLUMN "platform" TYPE "SupportedPlatforms_new" USING ("platform"::text::"SupportedPlatforms_new");
ALTER TYPE "SupportedPlatforms" RENAME TO "SupportedPlatforms_old";
ALTER TYPE "SupportedPlatforms_new" RENAME TO "SupportedPlatforms";
DROP TYPE "public"."SupportedPlatforms_old";
COMMIT;
