/*
  Warnings:

  - Added the required column `price` to the `Enrollment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('UNPAID', 'PAID', 'NO_PAYMENT_REQUIRED');

-- CreateEnum
CREATE TYPE "PaymentChannel" AS ENUM ('STRIPE', 'BANK_TRANSFER', 'OTHER');

-- AlterTable
ALTER TABLE "Enrollment" ADD COLUMN     "isInstallment" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "price" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "enrollmentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'UNPAID',
    "reference" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentChannel" "PaymentChannel" NOT NULL DEFAULT 'STRIPE',
    "attemptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_reference_key" ON "Transaction"("reference");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_enrollmentId_fkey" FOREIGN KEY ("enrollmentId") REFERENCES "Enrollment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
