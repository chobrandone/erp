import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, DocFooter } from "./shared";

const local = StyleSheet.create({
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 2,
    borderTopColor: "#5415BC",
    marginTop: 14,
    paddingTop: 8,
  },
  totalLabel: { fontSize: 11, fontWeight: 700 },
  totalValue: { fontSize: 14, fontWeight: 700, color: "#5415BC" },
  statusBanner: {
    marginTop: 14,
    padding: 6,
    textAlign: "center",
    fontSize: 10,
    fontWeight: 700,
    color: "#fff",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    borderRadius: 4,
  },
});

export type InvoiceData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  customerName: string;
  customerAddress: string;
  description: string;
  amount: string;
  status: "UNPAID" | "PAID";
  issuedAt: string;
  dueAt: string;
};

export function InvoicePdf(data: InvoiceData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Invoice"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Text style={styles.sectionTitle}>Billed To</Text>
        <View style={styles.grid}>
          <Field label="Customer" value={data.customerName} />
          <Field label="Address" value={data.customerAddress} />
          <Field label="Issued On" value={data.issuedAt} />
          <Field label="Due On" value={data.dueAt} />
        </View>

        <Text style={styles.sectionTitle}>Charges</Text>
        <View style={styles.grid}>
          <Field label="Description" value={data.description} full />
        </View>

        <View style={local.totalRow}>
          <Text style={local.totalLabel}>TOTAL DUE</Text>
          <Text style={local.totalValue}>{data.amount}</Text>
        </View>

        <View
          style={[
            local.statusBanner,
            { backgroundColor: data.status === "PAID" ? "#00CDAB" : "#DC2626" },
          ]}
        >
          <Text>{data.status}</Text>
        </View>

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
