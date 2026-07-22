import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, CheckboxGroup, DocFooter } from "./shared";

export type PTIRequestFormData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  customer: string;
  shippingLine: string;
  containerNumber: string;
  containerType: string;
  requiredDate: string;
  inspectionType: "STANDARD" | "SPECIAL" | "SMART";
  remarks: string;
  requestedBy: string;
  approvedBy: string;
};

export function PTIRequestFormPdf(data: PTIRequestFormData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="PTI Request Form"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <View style={styles.grid}>
          <Field label="Customer" value={data.customer} />
          <Field label="Shipping Line" value={data.shippingLine} />
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Container Type" value={data.containerType} />
          <Field label="Required Date" value={data.requiredDate} />
        </View>

        <CheckboxGroup
          label="Inspection Type"
          options={["Standard PTI", "Special PTI", "Smart PTI"]}
          selected={
            data.inspectionType === "STANDARD"
              ? "Standard PTI"
              : data.inspectionType === "SPECIAL"
                ? "Special PTI"
                : "Smart PTI"
          }
        />

        <Field label="Remarks" value={data.remarks} full />

        <View style={styles.grid}>
          <Field label="Requested By" value={data.requestedBy} />
          <Field label="Approved By" value={data.approvedBy} />
        </View>

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
