-- AlterTable
ALTER TABLE "GateTransaction" ADD COLUMN     "acceptanceRef" TEXT,
ADD COLUMN     "agent" TEXT,
ADD COLUMN     "bookingNo" TEXT,
ADD COLUMN     "newEquipmentNo" TEXT,
ADD COLUMN     "payloadKg" DOUBLE PRECISION,
ADD COLUMN     "sealType" TEXT,
ADD COLUMN     "stackPosition" TEXT;
