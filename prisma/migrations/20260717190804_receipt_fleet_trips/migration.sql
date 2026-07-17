-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "receiptData" BYTEA,
ADD COLUMN     "receiptMime" TEXT,
ADD COLUMN     "receiptName" TEXT,
ADD COLUMN     "receiptUploadedAt" TIMESTAMP(3),
ADD COLUMN     "receiptVerified" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Vehicle" ADD COLUMN     "odometerKm" INTEGER,
ADD COLUMN     "operationalStatus" TEXT NOT NULL DEFAULT 'IN_PARK';

-- CreateTable
CREATE TABLE "VehicleTrip" (
    "id" TEXT NOT NULL,
    "tripNo" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverPhone" TEXT,
    "cargoType" TEXT NOT NULL DEFAULT 'CONTAINER',
    "containerNumber" TEXT,
    "cargoDescription" TEXT,
    "origin" TEXT,
    "destination" TEXT NOT NULL,
    "departureTime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expectedReturn" TIMESTAMP(3),
    "returnTime" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'ONGOING',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleTrip_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VehicleTrip_tripNo_key" ON "VehicleTrip"("tripNo");

-- AddForeignKey
ALTER TABLE "VehicleTrip" ADD CONSTRAINT "VehicleTrip_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
