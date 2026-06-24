import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, DocFooter } from "./shared";

const local = StyleSheet.create({
  checklistRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 5,
  },
  checklistLabel: { fontSize: 9 },
  checklistResult: { fontSize: 9, fontWeight: 700 },
  resultBanner: {
    marginTop: 10,
    padding: 8,
    textAlign: "center",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
  },
});

export type PTICertificateData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  containerType: string;
  technician: string;
  inspectionDate: string;
  checklist: { label: string; result: "PASS" | "FAIL" }[];
  overallResult: "PASS" | "FAIL";
  remarks: string;
};

export function PTICertificate(data: PTICertificateData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="PTI Certificate"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Text style={styles.sectionTitle}>Container Details</Text>
        <View style={styles.grid}>
          <Field label="Container Number" value={data.containerNumber} />
          <Field label="Container Type" value={data.containerType} />
          <Field label="Inspection Date" value={data.inspectionDate} />
          <Field label="Technician" value={data.technician} />
        </View>

        <Text style={styles.sectionTitle}>Checklist</Text>
        {data.checklist.map((item, i) => (
          <View key={i} style={local.checklistRow}>
            <Text style={local.checklistLabel}>{item.label}</Text>
            <Text
              style={[
                local.checklistResult,
                { color: item.result === "PASS" ? "#059669" : "#DC2626" },
              ]}
            >
              {item.result}
            </Text>
          </View>
        ))}

        <View
          style={[
            local.resultBanner,
            { backgroundColor: data.overallResult === "PASS" ? "#00CDAB" : "#DC2626" },
          ]}
        >
          <Text>OVERALL RESULT: {data.overallResult === "PASS" ? "PASSED" : "FAILED"}</Text>
        </View>

        <View style={{ marginTop: 10 }}>
          <Field label="Remarks" value={data.remarks} full />
        </View>

        <SignatureBlock leftLabel="Technician Signature" rightLabel="Supervisor Approval" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
