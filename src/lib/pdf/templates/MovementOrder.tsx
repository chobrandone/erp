import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, CheckboxGroup, DocFooter } from "./shared";

export const MOVEMENT_REASON_LABELS: Record<string, string> = {
  YARD_ALLOCATION: "Yard Allocation",
  YARD_REPOSITION: "Yard Reposition",
  PTI: "PTI",
  REEFER_CONNECTION: "Reefer Connection",
  REPAIR: "Repair",
  GATE_OUT: "Gate Out",
};

export type MovementOrderData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  dateTime: string;
  containerNumber: string;
  containerType: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  equipment: string;
  operator: string;
  supervisorName: string;
  completed: boolean;
  completionTime: string;
  remarks: string;
};

export function MovementOrder(data: MovementOrderData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Container Movement Order"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Field label="Date &amp; Time" value={data.dateTime} />

        <Text style={styles.sectionTitle}>Container Details</Text>
        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Container Type" value={data.containerType} />
        </View>

        <Text style={styles.sectionTitle}>Movement Details</Text>
        <View style={styles.grid}>
          <Field label="From Location" value={data.fromLocation} />
          <Field label="To Location" value={data.toLocation} />
        </View>
        <CheckboxGroup
          label="Movement Reason"
          options={Object.values(MOVEMENT_REASON_LABELS)}
          selected={MOVEMENT_REASON_LABELS[data.reason] ?? data.reason}
        />
        <View style={styles.grid}>
          <Field label="Equipment Used" value={data.equipment} />
          <Field label="Operator" value={data.operator} />
        </View>

        <Text style={styles.sectionTitle}>Supervisor Approval</Text>
        <Field label="Name" value={data.supervisorName} />
        <SignatureBlock leftLabel="Supervisor Signature" rightLabel="Operator Signature" />

        <View style={{ marginTop: 14 }}>
          <CheckboxGroup
            label="Movement Completed"
            options={["Yes", "No"]}
            selected={data.completed ? "Yes" : "No"}
          />
          <Field label="Completion Time" value={data.completionTime} />
        </View>

        <Field label="Remarks" value={data.remarks} full />

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
