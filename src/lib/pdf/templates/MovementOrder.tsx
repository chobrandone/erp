import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, DocFooter } from "./shared";

export type MovementOrderData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  containerType: string;
  fromLocation: string;
  toLocation: string;
  reason: string;
  equipment: string;
  operator: string;
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

        <Text style={styles.sectionTitle}>Container Details</Text>
        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Container Type" value={data.containerType} />
        </View>

        <Text style={styles.sectionTitle}>Movement Details</Text>
        <View style={styles.grid}>
          <Field label="From Location" value={data.fromLocation} />
          <Field label="To Location" value={data.toLocation} />
          <Field label="Movement Reason" value={data.reason} />
          <Field label="Equipment Used" value={data.equipment} />
          <Field label="Operator" value={data.operator} />
        </View>

        <SignatureBlock leftLabel="Supervisor Approval" rightLabel="Operator Signature" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
