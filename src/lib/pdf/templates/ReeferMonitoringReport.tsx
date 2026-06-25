import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, CheckboxGroup, DocFooter } from "./shared";

export type ReeferMonitoringReportData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  location: string;
  plugNumber: string;
  monitoringDate: string;
  monitoringTime: string;
  setPointTemp: string;
  supplyAirTemp: string;
  returnAirTemp: string;
  ambientTemp: string;
  alarmStatus: "NORMAL" | "ALARM";
  alarmDescription: string;
  technician: string;
};

export function ReeferMonitoringReportPdf(data: ReeferMonitoringReportData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Reefer Monitoring Report"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Location" value={data.location} />
          <Field label="Plug Number" value={data.plugNumber} />
          <Field label="Monitoring Date" value={data.monitoringDate} />
          <Field label="Monitoring Time" value={data.monitoringTime} />
        </View>

        <Text style={styles.sectionTitle}>Settings</Text>
        <Field label="Set Point Temperature" value={data.setPointTemp} />

        <Text style={styles.sectionTitle}>Actual Readings</Text>
        <View style={styles.grid}>
          <Field label="Supply Air" value={data.supplyAirTemp} />
          <Field label="Return Air" value={data.returnAirTemp} />
          <Field label="Ambient Temperature" value={data.ambientTemp} />
        </View>

        <CheckboxGroup
          label="Alarm Status"
          options={["Normal", "Alarm"]}
          selected={data.alarmStatus === "NORMAL" ? "Normal" : "Alarm"}
        />
        <Field label="Alarm Description" value={data.alarmDescription} full />
        <Field label="Technician" value={data.technician} />

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
