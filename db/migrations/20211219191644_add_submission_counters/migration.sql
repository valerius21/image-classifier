-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentPrivateSubmissions" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "currentPublicSubmissions" INTEGER NOT NULL DEFAULT 0;
