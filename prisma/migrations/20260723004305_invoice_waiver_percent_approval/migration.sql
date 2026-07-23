-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "discountPending" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "discountPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountRequestedBy" TEXT;
