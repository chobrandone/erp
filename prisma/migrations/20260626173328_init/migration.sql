-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingLine" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ShippingLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "lengthFt" INTEGER NOT NULL,
    "isReefer" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "ContainerType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Container" (
    "id" TEXT NOT NULL,
    "containerNumber" TEXT NOT NULL,
    "containerTypeId" TEXT NOT NULL,
    "shippingLineId" TEXT,
    "status" TEXT NOT NULL,
    "isoCode" TEXT,
    "grossWeightKg" DOUBLE PRECISION,
    "tareWeightKg" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Container_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "row" TEXT NOT NULL,
    "bay" TEXT NOT NULL,
    "tier" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "isReeferSlot" BOOLEAN NOT NULL DEFAULT false,
    "maxStack" INTEGER NOT NULL DEFAULT 5,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateTransaction" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "customerId" TEXT,
    "shippingLineId" TEXT,
    "truckPlate" TEXT NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverIdNumber" TEXT,
    "sealNumber" TEXT,
    "grossWeightKg" DOUBLE PRECISION,
    "destination" TEXT,
    "releaseOrderNo" TEXT,
    "condition" TEXT NOT NULL DEFAULT 'GOOD',
    "damageRemarks" TEXT,
    "remarks" TEXT,
    "photoUrls" TEXT,
    "photosAttached" BOOLEAN NOT NULL DEFAULT false,
    "clerkInId" TEXT,
    "clerkOutId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GateTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContainerMovement" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "fromLocationId" TEXT,
    "toLocationId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "equipment" TEXT,
    "operator" TEXT,
    "movedById" TEXT,
    "supervisorName" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "completionTime" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContainerMovement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReeferMonitoring" (
    "id" TEXT NOT NULL,
    "reportNo" TEXT,
    "containerId" TEXT NOT NULL,
    "plugNumber" TEXT,
    "setTempC" DOUBLE PRECISION NOT NULL,
    "actualTempC" DOUBLE PRECISION NOT NULL,
    "supplyAirTempC" DOUBLE PRECISION,
    "returnAirTempC" DOUBLE PRECISION,
    "ambientTempC" DOUBLE PRECISION,
    "humidity" DOUBLE PRECISION,
    "powerStatus" TEXT NOT NULL,
    "alarmStatus" TEXT NOT NULL DEFAULT 'NORMAL',
    "alarmDescription" TEXT,
    "technician" TEXT,
    "remarks" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReeferMonitoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReeferConnection" (
    "id" TEXT NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "plugNumber" TEXT,
    "connectionTime" TIMESTAMP(3),
    "disconnectionTime" TIMESTAMP(3),
    "connectedBy" TEXT,
    "disconnectedBy" TEXT,
    "powerStatus" TEXT NOT NULL DEFAULT 'OPERATIONAL',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReeferConnection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PTIRequest" (
    "id" TEXT NOT NULL,
    "docNumber" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "customerId" TEXT,
    "shippingLineId" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requiredDate" TIMESTAMP(3),
    "inspectionType" TEXT NOT NULL DEFAULT 'STANDARD',
    "remarks" TEXT,
    "requestedBy" TEXT,
    "approvedBy" TEXT,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PTIRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PTIInspection" (
    "id" TEXT NOT NULL,
    "ptiRequestId" TEXT NOT NULL,
    "inspectorId" TEXT,
    "certificateNumber" TEXT,
    "checklistJson" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "remarks" TEXT,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PTIInspection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Repair" (
    "id" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "damageType" TEXT NOT NULL,
    "description" TEXT,
    "estimatedCost" DOUBLE PRECISION,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Repair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "refId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DamageSurvey" (
    "id" TEXT NOT NULL,
    "surveyNo" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "location" TEXT,
    "surveyDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "surveyor" TEXT,
    "frontEnd" TEXT,
    "rearEnd" TEXT,
    "roof" TEXT,
    "floor" TEXT,
    "leftSide" TEXT,
    "rightSide" TEXT,
    "severity" TEXT NOT NULL DEFAULT 'MINOR',
    "photosAttached" BOOLEAN NOT NULL DEFAULT false,
    "repairRecommended" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DamageSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairEstimate" (
    "id" TEXT NOT NULL,
    "estimateNo" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "workDescription" TEXT NOT NULL,
    "laborCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "materialCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "equipmentCost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "customerApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvalDate" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairEstimate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepairWorkOrder" (
    "id" TEXT NOT NULL,
    "workOrderNo" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "assignedTechnician" TEXT,
    "startDate" TIMESTAMP(3),
    "expectedCompletion" TIMESTAMP(3),
    "workToBeDone" TEXT NOT NULL,
    "materialsRequired" TEXT,
    "completionStatus" TEXT NOT NULL DEFAULT 'OPEN',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepairWorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReleaseOrder" (
    "id" TEXT NOT NULL,
    "releaseNo" TEXT NOT NULL,
    "containerId" TEXT NOT NULL,
    "customerId" TEXT,
    "shippingLineId" TEXT,
    "authorizedReleaseDate" TIMESTAMP(3),
    "destination" TEXT,
    "approvedBy" TEXT,
    "gateAuthorization" TEXT NOT NULL DEFAULT 'APPROVED',
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReleaseOrder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNPAID',
    "issuedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dueAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metaJson" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Customer_code_key" ON "Customer"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingLine_code_key" ON "ShippingLine"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerType_code_key" ON "ContainerType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Container_containerNumber_key" ON "Container"("containerNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Location_code_key" ON "Location"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_containerId_key" ON "Inventory"("containerId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_locationId_key" ON "Inventory"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "GateTransaction_docNumber_key" ON "GateTransaction"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ContainerMovement_docNumber_key" ON "ContainerMovement"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ReeferMonitoring_reportNo_key" ON "ReeferMonitoring"("reportNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReeferConnection_referenceNo_key" ON "ReeferConnection"("referenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "PTIRequest_docNumber_key" ON "PTIRequest"("docNumber");

-- CreateIndex
CREATE UNIQUE INDEX "PTIInspection_ptiRequestId_key" ON "PTIInspection"("ptiRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "PTIInspection_certificateNumber_key" ON "PTIInspection"("certificateNumber");

-- CreateIndex
CREATE UNIQUE INDEX "DamageSurvey_surveyNo_key" ON "DamageSurvey"("surveyNo");

-- CreateIndex
CREATE UNIQUE INDEX "RepairEstimate_estimateNo_key" ON "RepairEstimate"("estimateNo");

-- CreateIndex
CREATE UNIQUE INDEX "RepairWorkOrder_workOrderNo_key" ON "RepairWorkOrder"("workOrderNo");

-- CreateIndex
CREATE UNIQUE INDEX "ReleaseOrder_releaseNo_key" ON "ReleaseOrder"("releaseNo");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON "Invoice"("invoiceNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_code_key" ON "Equipment"("code");

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_containerTypeId_fkey" FOREIGN KEY ("containerTypeId") REFERENCES "ContainerType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Container" ADD CONSTRAINT "Container_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateTransaction" ADD CONSTRAINT "GateTransaction_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateTransaction" ADD CONSTRAINT "GateTransaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateTransaction" ADD CONSTRAINT "GateTransaction_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateTransaction" ADD CONSTRAINT "GateTransaction_clerkInId_fkey" FOREIGN KEY ("clerkInId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateTransaction" ADD CONSTRAINT "GateTransaction_clerkOutId_fkey" FOREIGN KEY ("clerkOutId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerMovement" ADD CONSTRAINT "ContainerMovement_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerMovement" ADD CONSTRAINT "ContainerMovement_fromLocationId_fkey" FOREIGN KEY ("fromLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerMovement" ADD CONSTRAINT "ContainerMovement_toLocationId_fkey" FOREIGN KEY ("toLocationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContainerMovement" ADD CONSTRAINT "ContainerMovement_movedById_fkey" FOREIGN KEY ("movedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReeferMonitoring" ADD CONSTRAINT "ReeferMonitoring_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReeferConnection" ADD CONSTRAINT "ReeferConnection_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTIRequest" ADD CONSTRAINT "PTIRequest_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTIRequest" ADD CONSTRAINT "PTIRequest_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTIRequest" ADD CONSTRAINT "PTIRequest_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTIInspection" ADD CONSTRAINT "PTIInspection_ptiRequestId_fkey" FOREIGN KEY ("ptiRequestId") REFERENCES "PTIRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PTIInspection" ADD CONSTRAINT "PTIInspection_inspectorId_fkey" FOREIGN KEY ("inspectorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Repair" ADD CONSTRAINT "Repair_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DamageSurvey" ADD CONSTRAINT "DamageSurvey_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairEstimate" ADD CONSTRAINT "RepairEstimate_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepairWorkOrder" ADD CONSTRAINT "RepairWorkOrder_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseOrder" ADD CONSTRAINT "ReleaseOrder_containerId_fkey" FOREIGN KEY ("containerId") REFERENCES "Container"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseOrder" ADD CONSTRAINT "ReleaseOrder_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReleaseOrder" ADD CONSTRAINT "ReleaseOrder_shippingLineId_fkey" FOREIGN KEY ("shippingLineId") REFERENCES "ShippingLine"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
