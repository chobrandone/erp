import { Document, Page, Text, StyleSheet } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, CheckboxGroup, SignatureBlock, DocFooter } from "./shared";

const local = StyleSheet.create({
  workItem: { fontSize: 9, marginBottom: 4 },
});

export type RepairWorkOrderData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  assignedTechnician: string;
  startDate: string;
  expectedCompletion: string;
  workToBeDone: string[];
  materialsRequired: string;
  completionStatus: "OPEN" | "IN_PROGRESS" | "COMPLETED";
  remarks: string;
};

export function RepairWorkOrderPdf(data: RepairWorkOrderData) {
  const statusLabel =
    data.completionStatus === "OPEN" ? "Open" : data.completionStatus === "IN_PROGRESS" ? "In Progress" : "Completed";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Repair Work Order"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Field label="Container Number" value={data.containerNumber} />
        <Field label="Assigned Technician" value={data.assignedTechnician} />
        <Field label="Start Date" value={data.startDate} />
        <Field label="Expected Completion" value={data.expectedCompletion} />

        <Text style={styles.sectionTitle}>Work To Be Done</Text>
        {data.workToBeDone.map((line, i) => (
          <Text key={i} style={local.workItem}>
            {i + 1}. {line}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Materials Required</Text>
        <Text style={local.workItem}>{data.materialsRequired || "-"}</Text>

        <CheckboxGroup
          label="Completion Status"
          options={["Open", "In Progress", "Completed"]}
          selected={statusLabel}
        />

        <Field label="Remarks" value={data.remarks} full />
        <SignatureBlock leftLabel="Supervisor Signature" rightLabel="" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
