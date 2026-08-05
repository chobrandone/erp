-- CreateTable
CREATE TABLE "SyncConflict" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity" TEXT NOT NULL,
    "recordId" TEXT NOT NULL,
    "deviceValue" TEXT NOT NULL,
    "serverValue" TEXT NOT NULL,
    "deviceUpdatedAt" TIMESTAMP(3),
    "serverUpdatedAt" TIMESTAMP(3),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolution" TEXT,
    "resolvedBy" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SyncConflict_pkey" PRIMARY KEY ("id")
);
