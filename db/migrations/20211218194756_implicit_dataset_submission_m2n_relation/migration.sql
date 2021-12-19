/*
  Warnings:

  - You are about to drop the column `datasetId` on the `Submission` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Submission" DROP CONSTRAINT "Submission_datasetId_fkey";

-- AlterTable
ALTER TABLE "Submission" DROP COLUMN "datasetId";

-- CreateTable
CREATE TABLE "_DatasetToSubmission" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_DatasetToSubmission_AB_unique" ON "_DatasetToSubmission"("A", "B");

-- CreateIndex
CREATE INDEX "_DatasetToSubmission_B_index" ON "_DatasetToSubmission"("B");

-- AddForeignKey
ALTER TABLE "_DatasetToSubmission" ADD FOREIGN KEY ("A") REFERENCES "Dataset"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DatasetToSubmission" ADD FOREIGN KEY ("B") REFERENCES "Submission"("id") ON DELETE CASCADE ON UPDATE CASCADE;
