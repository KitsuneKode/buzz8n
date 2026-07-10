-- Per-user credential title uniqueness (scoped by archived flag)
CREATE UNIQUE INDEX IF NOT EXISTS "credential_userId_title_archived_key" ON "credential"("userId", "title", "archived");
