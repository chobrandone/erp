import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, CheckboxGroup, SignatureBlock, DocFooter } from "./shared";

export type ReleaseOrderData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  customer: string;
  shippingLine: string;
  containerNumber: string;
  authorizedReleaseDate: string;
  destination: string;
  approvedBy: string;
  gateAuthorization: "APPROVED" | "REJECTED";
  remarks: string;
};

export function ReleaseOrderPdf(data: ReleaseOrderData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Container Release Order"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <View style={styles.grid}>
          <Field label="Customer" value={data.customer} />
          <Field label="Shipping Line" value={data.shippingLine} />
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Authorized Release Date" value={data.authorizedReleaseDate} />
          <Field label="Destination" value={data.destination} />
          <Field label="Approved By" value={data.approvedBy} />
        </View>

        <Text style={styles.sectionTitle}>Gate Authorization</Text>
        <CheckboxGroup
          options={["Approved", "Rejected"]}
          selected={data.gateAuthorization === "APPROVED" ? "Approved" : "Rejected"}
        />

        <Field label="Remarks" value={data.remarks} full />
        <SignatureBlock leftLabel="Signature" rightLabel="" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
