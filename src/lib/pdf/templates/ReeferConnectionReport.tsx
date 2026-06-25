import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, CheckboxGroup, DocFooter } from "./shared";

export type ReeferConnectionReportData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  plugNumber: string;
  connectionTime: string;
  disconnectionTime: string;
  connectedBy: string;
  disconnectedBy: string;
  powerStatus: "OPERATIONAL" | "FAULT";
  remarks: string;
};

export function ReeferConnectionReportPdf(data: ReeferConnectionReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Reefer Connection Report"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Plug Number" value={data.plugNumber} />
          <Field label="Connection Time" value={data.connectionTime} />
          <Field label="Disconnection Time" value={data.disconnectionTime} />
          <Field label="Connected By" value={data.connectedBy} />
          <Field label="Disconnected By" value={data.disconnectedBy} />
        </View>

        <CheckboxGroup
          label="Power Status"
          options={["Operational", "Fault"]}
          selected={data.powerStatus === "OPERATIONAL" ? "Operational" : "Fault"}
        />
        <Field label="Remarks" value={data.remarks} full />

        <Text style={styles.sectionTitle}>Approval</Text>
        <SignatureBlock leftLabel="Supervisor Signature" rightLabel="" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
