/*
  Warnings:

  - You are about to drop the `_DatasetToSubmission` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `datasetId` to the `Submission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_DatasetToSubmission" DROP CONSTRAINT "_DatasetToSubmission_A_fkey";

-- DropForeignKey
ALTER TABLE "_DatasetToSubmission" DROP CONSTRAINT "_DatasetToSubmission_B_fkey";

-- AlterTable
ALTER TABLE "Submission" ADD COLUMN     "datasetId" TEXT NOT NULL;

-- DropTable
DROP TABLE "_DatasetToSubmission";

-- AddForeignKey
ALTER TABLE "Submission" ADD CONSTRAINT "Submission_datasetId_fkey" FOREIGN KEY ("datasetId") REFERENCES "Dataset"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
