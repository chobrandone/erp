import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, DocFooter } from "./shared";

const local = StyleSheet.create({
  tableHead: { flexDirection: "row", backgroundColor: "#1F5FB0", paddingVertical: 4, paddingHorizontal: 6, marginTop: 4 },
  th: { color: "#fff", fontSize: 8, fontWeight: 700 },
  row: { flexDirection: "row", paddingVertical: 4, paddingHorizontal: 6, borderBottomWidth: 0.5, borderBottomColor: "#E5E7EB" },
  rowAlt: { backgroundColor: "#F8FAFC" },
  cDesc: { flex: 4, fontSize: 8.5 },
  cQty: { flex: 1, fontSize: 8.5, textAlign: "right" },
  cPu: { flex: 2, fontSize: 8.5, textAlign: "right" },
  cTot: { flex: 2, fontSize: 8.5, textAlign: "right", fontWeight: 700 },
  totalsBox: { marginTop: 10, marginLeft: "auto", width: "55%" },
  totalRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 },
  totalLabel: { fontSize: 9, color: "#374151" },
  totalVal: { fontSize: 9, color: "#111827" },
  grandRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1.5, borderTopColor: "#1F5FB0", marginTop: 4, paddingTop: 4 },
  grandLabel: { fontSize: 11, fontWeight: 700 },
  grandVal: { fontSize: 13, fontWeight: 700, color: "#1F5FB0" },
  statusBanner: { marginTop: 12, padding: 5, fontSize: 9, fontWeight: 700, color: "#fff", alignSelf: "flex-start", paddingHorizontal: 12, borderRadius: 4 },
  payNote: { marginTop: 10, fontSize: 8, color: "#6B7280" },
});

export type InvoiceLineData = { description: string; quantity: number; unitPrice: string; lineTotal: string };

export type InvoiceData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  customerName: string;
  customerAddress: string;
  lines: InvoiceLineData[];
  subtotal: string; // Montant HT
  tvaRate: number;
  tvaAmount: string;
  amount: string; // Montant TTC
  paymentMethod: string;
  status: "UNPAID" | "PAID";
  issuedAt: string;
  dueAt: string;
};

export function InvoicePdf(data: InvoiceData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="FACTURE"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
          qrCaption="Scanner pour la facture en ligne"
        />

        <Text style={styles.sectionTitle}>FACTURÉ À / CLIENT</Text>
        <View style={styles.grid}>
          <Field label="Client" value={data.customerName} />
          <Field label="Adresse" value={data.customerAddress} />
          <Field label="Date d'émission" value={data.issuedAt} />
          <Field label="Échéance" value={data.dueAt} />
        </View>

        <Text style={styles.sectionTitle}>DÉTAIL DES PRESTATIONS</Text>
        <View style={local.tableHead}>
          <Text style={[local.th, { flex: 4 }]}>Désignation</Text>
          <Text style={[local.th, { flex: 1, textAlign: "right" }]}>Qté</Text>
          <Text style={[local.th, { flex: 2, textAlign: "right" }]}>P.U. (FCFA)</Text>
          <Text style={[local.th, { flex: 2, textAlign: "right" }]}>Montant (FCFA)</Text>
        </View>
        {data.lines.map((l, i) => (
          <View key={i} style={[local.row, ...(i % 2 ? [local.rowAlt] : [])]}>
            <Text style={local.cDesc}>{l.description}</Text>
            <Text style={local.cQty}>{l.quantity}</Text>
            <Text style={local.cPu}>{l.unitPrice}</Text>
            <Text style={local.cTot}>{l.lineTotal}</Text>
          </View>
        ))}

        <View style={local.totalsBox}>
          <View style={local.totalRow}>
            <Text style={local.totalLabel}>Montant HT</Text>
            <Text style={local.totalVal}>{data.subtotal}</Text>
          </View>
          <View style={local.totalRow}>
            <Text style={local.totalLabel}>TVA ({data.tvaRate}%)</Text>
            <Text style={local.totalVal}>{data.tvaAmount}</Text>
          </View>
          <View style={local.grandRow}>
            <Text style={local.grandLabel}>NET À PAYER (TTC)</Text>
            <Text style={local.grandVal}>{data.amount}</Text>
          </View>
        </View>

        <Text style={local.payNote}>Mode de paiement : {data.paymentMethod || "—"}</Text>
        <Text style={local.payNote}>
          Règlement par virement : BICEC 06808 6924140800163 — au nom de NÉGOCE &amp; SERVICES N.S. SARL
        </Text>

        <View
          style={[
            local.statusBanner,
            { backgroundColor: data.status === "PAID" ? "#16A34A" : "#DC2626" },
          ]}
        >
          <Text>{data.status === "PAID" ? "PAYÉE" : "IMPAYÉE"}</Text>
        </View>

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
