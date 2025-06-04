/*
  Warnings:

  - You are about to drop the column `enrollmentId` on the `Transaction` table. All the data in the column will be lost.
  - Added the required column `installmentalFee` to the `Program` table without a default value. This is not possible if the table is not empty.
  - Added the required column `entityId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_enrollmentId_fkey";

-- AlterTable
ALTER TABLE "Program" ADD COLUMN     "installmentalFee" DOUBLE PRECISION NOT NULL,
ALTER COLUMN "fee" DROP NOT NULL,
ALTER COLUMN "fee" SET DEFAULT 0.00;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "enrollmentId",
ADD COLUMN     "entityId" TEXT NOT NULL;
