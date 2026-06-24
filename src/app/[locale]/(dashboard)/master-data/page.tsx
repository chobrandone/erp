import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MasterDataPanel, DisplayColumnDef } from "@/components/master-data/MasterDataPanel";
import { prisma } from "@/lib/prisma";

export default async function MasterDataPage() {
  const t = await getTranslations("masterData");
  const tc = await getTranslations("common");

  const [customers, shippingLines, containerTypes, equipment] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.shippingLine.findMany({ orderBy: { name: "asc" } }),
    prisma.containerType.findMany({ orderBy: { code: "asc" } }),
    prisma.equipment.findMany({ orderBy: { code: "asc" } }),
  ]);

  const customerCols: DisplayColumnDef[] = [
    { header: t("code"), key: "code" },
    { header: t("name"), key: "name" },
    { header: t("contact"), key: "contactName" },
    { header: t("phone"), key: "phone" },
  ];

  const lineCols: DisplayColumnDef[] = [
    { header: t("code"), key: "code" },
    { header: t("name"), key: "name" },
  ];

  const typeCols: DisplayColumnDef[] = [
    { header: t("code"), key: "code" },
    { header: t("description"), key: "description" },
    { header: t("length"), key: "lengthFt" },
    { header: t("reefer"), key: "isReefer", format: "boolean" },
  ];

  const equipCols: DisplayColumnDef[] = [
    { header: t("code"), key: "code" },
    { header: t("type"), key: "type", format: "underscoreToSpace" },
    { header: tc("status"), key: "status" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />

      <MasterDataPanel
        title={t("customers")}
        apiPath="/api/customers"
        fields={[
          { key: "name", label: t("name") },
          { key: "contactName", label: t("contact") },
          { key: "phone", label: t("phone") },
          { key: "email", label: t("email") },
        ]}
        columns={customerCols}
        initialRows={customers}
      />

      <MasterDataPanel
        title={t("shippingLines")}
        apiPath="/api/shipping-lines"
        fields={[
          { key: "code", label: t("code"), placeholder: "MAEU" },
          { key: "name", label: t("name") },
        ]}
        columns={lineCols}
        initialRows={shippingLines}
      />

      <MasterDataPanel
        title={t("containerTypes")}
        apiPath="/api/container-types"
        fields={[
          { key: "code", label: t("code"), placeholder: "40HC" },
          { key: "description", label: t("description") },
          { key: "lengthFt", label: t("length"), type: "number" },
          { key: "isReefer", label: t("reefer"), type: "checkbox" },
        ]}
        columns={typeCols}
        initialRows={containerTypes}
      />

      <MasterDataPanel
        title={t("equipment")}
        apiPath="/api/equipment"
        fields={[
          { key: "code", label: t("code"), placeholder: "RS-03" },
          { key: "type", label: t("type"), placeholder: "REACH_STACKER" },
        ]}
        columns={equipCols}
        initialRows={equipment}
      />
    </div>
  );
}
