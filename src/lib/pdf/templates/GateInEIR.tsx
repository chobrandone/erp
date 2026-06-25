import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, PhotoPlaceholders, CheckboxGroup, DocFooter } from "./shared";

export type GateInEIRData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  date: string;
  time: string;
  shippingLine: string;
  customer: string;
  truckPlate: string;
  driverName: string;
  driverId: string;
  containerNumber: string;
  isoType: string;
  size: string;
  status: "EMPTY" | "FULL";
  condition: "GOOD" | "DAMAGED";
  damageRemarks: string;
  sealNumber: string;
  locationAssigned: string;
  photosAttached: boolean;
};

export function GateInEIR(data: GateInEIRData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Equipment Interchange Receipt (Gate In)"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <View style={styles.grid}>
          <Field label="Date" value={data.date} />
          <Field label="Time" value={data.time} />
        </View>

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
          <CheckboxGroup label="Status" options={["Empty", "Full"]} selected={data.status === "EMPTY" ? "Empty" : "Full"} />
        </View>

        <Text style={styles.sectionTitle}>Arrival Condition</Text>
        <CheckboxGroup
          options={["Good Condition", "Damaged"]}
          selected={data.condition === "GOOD" ? "Good Condition" : "Damaged"}
        />
        {data.condition === "DAMAGED" && <Field label="Damage Description" value={data.damageRemarks} full />}
        <View style={styles.grid}>
          <Field label="Seal Number" value={data.sealNumber} />
          <Field label="Container Location Assigned" value={data.locationAssigned} />
        </View>
        <CheckboxGroup label="Photos Attached" options={["Yes", "No"]} selected={data.photosAttached ? "Yes" : "No"} />

        <Text style={styles.sectionTitle}>Photographs</Text>
        <PhotoPlaceholders count={4} />

        <Text style={styles.sectionTitle}>Received By</Text>
        <SignatureBlock leftLabel="Gate Clerk Signature" rightLabel="Driver Signature" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
