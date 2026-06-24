import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, DocFooter } from "./shared";

export type GateOutEIRData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  containerType: string;
  currentLocation: string;
  releaseOrderNo: string;
  destination: string;
  customer: string;
  truckPlate: string;
  driverName: string;
  condition: string;
  remarks: string;
};

export function GateOutEIR(data: GateOutEIRData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Equipment Interchange Receipt — Gate Out"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Text style={styles.sectionTitle}>Container Details</Text>
        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Container Type" value={data.containerType} />
          <Field label="Current Yard Location" value={data.currentLocation} />
        </View>

        <Text style={styles.sectionTitle}>Release Details</Text>
        <View style={styles.grid}>
          <Field label="Release Order No" value={data.releaseOrderNo} />
          <Field label="Destination" value={data.destination} />
          <Field label="Customer" value={data.customer} />
        </View>

        <Text style={styles.sectionTitle}>Truck Details</Text>
        <View style={styles.grid}>
          <Field label="Truck Registration" value={data.truckPlate} />
          <Field label="Driver Name" value={data.driverName} />
        </View>

        <Text style={styles.sectionTitle}>Final Condition</Text>
        <View style={styles.grid}>
          <Field label="Condition" value={data.condition} />
          <Field label="Remarks" value={data.remarks} full />
        </View>

        <SignatureBlock leftLabel="Operations Officer Signature" rightLabel="Driver Signature" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
