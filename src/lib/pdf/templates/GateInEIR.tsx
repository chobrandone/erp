import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, PhotoPlaceholders, DocFooter } from "./shared";

export type GateInEIRData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  shippingLine: string;
  customer: string;
  truckPlate: string;
  driverName: string;
  driverId: string;
  containerNumber: string;
  isoType: string;
  size: string;
  status: string;
  condition: string;
  damageRemarks: string;
  sealNumber: string;
  locationAssigned: string;
};

export function GateInEIR(data: GateInEIRData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Equipment Interchange Receipt — Gate In"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Text style={styles.sectionTitle}>Customer Information</Text>
        <View style={styles.grid}>
          <Field label="Shipping Line" value={data.shippingLine} />
          <Field label="Customer" value={data.customer} />
          <Field label="Truck Registration" value={data.truckPlate} />
          <Field label="Driver Name" value={data.driverName} />
          <Field label="Driver ID" value={data.driverId} />
        </View>

        <Text style={styles.sectionTitle}>Container Information</Text>
        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="ISO Type" value={data.isoType} />
          <Field label="Size" value={data.size} />
          <Field label="Status" value={data.status} />
          <Field label="Seal Number" value={data.sealNumber} />
          <Field label="Location Assigned" value={data.locationAssigned} />
          <Field label="Arrival Condition" value={data.condition} />
          {data.condition === "DAMAGED" && (
            <Field label="Damage Description" value={data.damageRemarks} full />
          )}
        </View>

        <Text style={styles.sectionTitle}>Photographs</Text>
        <PhotoPlaceholders count={4} />

        <SignatureBlock leftLabel="Gate Clerk Signature" rightLabel="Driver Signature" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
