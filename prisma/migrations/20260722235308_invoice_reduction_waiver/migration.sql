-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "discountAuthorizedBy" TEXT,
ADD COLUMN     "discountReason" TEXT;
