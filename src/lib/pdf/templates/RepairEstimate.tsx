import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, DocFooter } from "./shared";

const local = StyleSheet.create({
  workItem: { fontSize: 9, marginBottom: 4 },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#5415BC",
    marginTop: 10,
    paddingTop: 8,
  },
  totalLabel: { fontSize: 11, fontWeight: 700 },
  totalValue: { fontSize: 14, fontWeight: 700, color: "#5415BC" },
  approvalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 24 },
  approvalBox: { width: "45%" },
  approvalLine: { borderBottomWidth: 1, borderBottomColor: "#9CA3AF", height: 30 },
  approvalLabel: { fontSize: 8, color: "#6B7280", marginTop: 4 },
});

export type RepairEstimateData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  workDescription: string[];
  laborCost: string;
  materialCost: string;
  equipmentCost: string;
  totalCost: string;
  approvalDate: string;
  remarks: string;
};

export function RepairEstimatePdf(data: RepairEstimateData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Repair Estimate"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Field label="Container Number" value={data.containerNumber} />

        <Text style={styles.sectionTitle}>Work Description</Text>
        {data.workDescription.map((line, i) => (
          <Text key={i} style={local.workItem}>
            {i + 1}. {line}
          </Text>
        ))}

        <Text style={styles.sectionTitle}>Cost Breakdown</Text>
        <View style={styles.grid}>
          <Field label="Labor Cost" value={data.laborCost} />
          <Field label="Material Cost" value={data.materialCost} />
          <Field label="Equipment Cost" value={data.equipmentCost} />
        </View>

        <Field label="Remarks" value={data.remarks} full />

        <View style={local.totalRow}>
          <Text style={local.totalLabel}>TOTAL COST</Text>
          <Text style={local.totalValue}>{data.totalCost}</Text>
        </View>

        <View style={local.approvalRow}>
          <View style={local.approvalBox}>
            <View style={local.approvalLine} />
            <Text style={local.approvalLabel}>Customer Approval</Text>
          </View>
          <View style={local.approvalBox}>
            <View style={local.approvalLine} />
            <Text style={local.approvalLabel}>Date: {data.approvalDate}</Text>
          </View>
        </View>

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
