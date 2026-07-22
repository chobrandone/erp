-- AlterTable
ALTER TABLE "Repair" ADD COLUMN     "component" TEXT,
ADD COLUMN     "repairMethod" TEXT,
ADD COLUMN     "repairResponsibility" TEXT,
ADD COLUMN     "severity" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- Map legacy repair statuses to the new depot-ERP status set
UPDATE "Repair" SET "status" = 'PENDING' WHERE "status" = 'OPEN';
UPDATE "Repair" SET "status" = 'APPROVED' WHERE "status" = 'IN_PROGRESS';
UPDATE "Repair" SET "status" = 'REPAIRED' WHERE "status" = 'COMPLETED';
