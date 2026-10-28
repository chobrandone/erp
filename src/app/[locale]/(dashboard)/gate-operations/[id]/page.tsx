import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { notFound } from "next/navigation";
import { GateTransactionDetailClient } from "./GateTransactionDetailClient";
import { EditGateTransactionButton } from "@/components/gate/EditGateTransactionButton";

export default async function GateTransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("gateOperations");
  const tc = await getTranslations("common");

  const transaction = await prisma.gateTransaction.findUnique({
    where: { id },
    include: { container: { include: { containerType: true } }, customer: true, shippingLine: true },
  });

  if (!transaction) notFound();

  const allContainers = await prisma.container.findMany({
    include: { containerType: true },
    orderBy: { containerNumber: "asc" },
  });
  const containerOptions = allContainers.map((c) => ({ id: c.id, label: `${c.containerNumber} (${c.containerType.code})`, number: c.containerNumber }));

  return (
    <div>
      <PageHeader title={transaction.docNumber} subtitle={t("title")} />
      <div className="rounded-xl border border-border-color bg-surface p-5 max-w-2xl space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{t("type")}</span>
          <StatusBadge status={transaction.type} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">Container</span>
          <span className="font-medium text-fg">{transaction.container.containerNumber}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{t("truck")}</span>
          <span className="font-medium text-fg">{transaction.truckPlate}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{tc("driver")}</span>
          <span className="font-medium text-fg">{transaction.driverName || "-"}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{tc("status")}</span>
          <StatusBadge status={transaction.condition} />
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-fg-muted">{tc("date")}</span>
          <span className="font-medium text-fg">{formatDateTime(transaction.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 pt-2">
          <GateTransactionDetailClient id={transaction.id} />
          <EditGateTransactionButton
            containers={containerOptions}
            transaction={{
              id: transaction.id,
              type: transaction.type,
              containerId: transaction.containerId,
              containerNumber: transaction.container.containerNumber,
              eirId: transaction.docNumber,
              truckPlate: transaction.truckPlate,
              driverName: transaction.driverName,
              driverIdNumber: transaction.driverIdNumber,
              sealNumber: transaction.sealNumber,
              sealNumber2: transaction.sealNumber2,
              condition: transaction.condition,
              damageRemarks: transaction.damageRemarks,
              destination: transaction.destination,
              releaseOrderNo: transaction.releaseOrderNo,
              remarks: transaction.remarks,
              deliveryHeading: transaction.deliveryHeading,
              grossWeightKg: transaction.grossWeightKg,
              payloadKg: transaction.payloadKg,
              statut: transaction.statut,
              documentType: transaction.documentType,
              documentNumber: transaction.documentNumber,
              navire: transaction.navire,
              voyage: transaction.voyage,
              pod: transaction.pod,
              isoCode: transaction.isoCode,
              acconier: transaction.acconier,
              transitaire: transaction.transitaire,
              marchandise: transaction.marchandise,
              imdg: transaction.imdg,
              region: transaction.region,
              gatePost: transaction.gatePost,
              tempGate: transaction.tempGate,
              freeDays: transaction.freeDays,
              bookingNo: transaction.bookingNo,
              agent: transaction.agent,
              acceptanceRef: transaction.acceptanceRef,
              sealType: transaction.sealType,
              newEquipmentNo: transaction.newEquipmentNo,
              createdAt: transaction.createdAt.toISOString(),
            }}
          />
        </div>
      </div>
    </div>
  );
}
