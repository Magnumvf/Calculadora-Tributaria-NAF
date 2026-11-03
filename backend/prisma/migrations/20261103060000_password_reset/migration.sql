ALTER TABLE "users"
ADD COLUMN "resetTokenHash" TEXT,
ADD COLUMN "resetTokenExpiresAt" TIMESTAMP(3),
ADD COLUMN "resetRequestedAt" TIMESTAMP(3),
ADD COLUMN "sessionVersion" INTEGER NOT NULL DEFAULT 0;
CREATE UNIQUE INDEX "users_resetTokenHash_key" ON "users"("resetTokenHash");
