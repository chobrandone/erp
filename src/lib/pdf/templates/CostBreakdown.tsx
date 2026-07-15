import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { DocFooter } from "./shared";

const s = StyleSheet.create({
  page: { padding: 36, fontSize: 9, fontFamily: "Helvetica", color: "#111827" },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#5415BC",
    paddingBottom: 10,
    marginBottom: 16,
  },
  companyName: { fontSize: 14, fontWeight: 700, color: "#5415BC" },
  companyMeta: { fontSize: 8, color: "#6B7280", marginTop: 2 },
  docTitle: { fontSize: 12, fontWeight: 700 },
  docMeta: { fontSize: 8, color: "#6B7280", marginTop: 2 },
  sectionBar: {
    fontSize: 9,
    fontWeight: 700,
    color: "#ffffff",
    backgroundColor: "#0080FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 6,
  },
  row: { flexDirection: "row", paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: "#F3F4F6" },
  rowAlt: { backgroundColor: "#F9FAFB" },
  colName: { flex: 3, fontSize: 9, color: "#111827" },
  colSub: { flex: 4, fontSize: 8, color: "#6B7280" },
  colPrice: { flex: 1.5, fontSize: 9, fontWeight: 700, color: "#0059EF", textAlign: "right" },
  badge: { fontSize: 7, color: "#fff", backgroundColor: "#00B7D7", paddingHorizontal: 4, paddingVertical: 1, borderRadius: 3 },
  badgeFree: { backgroundColor: "#10B981" },
  totalBox: {
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: "#0059EF",
    borderRadius: 6,
    padding: 12,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  totalLabel: { fontSize: 9, color: "#374151" },
  totalValue: { fontSize: 9, color: "#374151" },
  grandLabel: { fontSize: 12, fontWeight: 700, color: "#111827" },
  grandValue: { fontSize: 14, fontWeight: 700, color: "#0059EF" },
  divider: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB", marginVertical: 6 },
  noteText: { fontSize: 8, color: "#6B7280", marginTop: 6 },
  stepRow: { flexDirection: "row", marginBottom: 5, alignItems: "flex-start" },
  stepNum: { fontSize: 9, fontWeight: 700, color: "#0059EF", width: 16 },
  stepText: { fontSize: 9, color: "#374151", flex: 1 },
  tierGrid: { flexDirection: "row", gap: 8, marginTop: 2 },
  tierBox: { flex: 1, borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 5, padding: 7 },
  tierBoxRec: { borderColor: "#0059EF", borderWidth: 1.5 },
  tierName: { fontSize: 8, fontWeight: 700, color: "#111827", marginBottom: 3 },
  tierPrice: { fontSize: 11, fontWeight: 700, color: "#0059EF", marginBottom: 3 },
  tierDetail: { fontSize: 7.5, color: "#6B7280", lineHeight: 1.5 },
});

export function CostBreakdownPdf({ generatedAt }: { generatedAt: string }) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.headerRow}>
          <View>
            <Text style={s.companyName}>Container Depot ERP</Text>
            <Text style={s.companyMeta}>Container Storage Park — Yard Management System</Text>
            <Text style={s.companyMeta}>Generated: {generatedAt}</Text>
          </View>
          <View>
            <Text style={s.docTitle}>Infrastructure Cost Breakdown</Text>
            <Text style={s.docMeta}>Deployment &amp; Hosting Proposal</Text>
          </View>
        </View>

        {/* Database */}
        <Text style={s.sectionBar}>1. Database — Neon Postgres</Text>
        <View style={s.tierGrid}>
          <View style={s.tierBox}>
            <Text style={s.tierName}>Free Tier  (current)</Text>
            <Text style={s.tierPrice}>$0 / mo</Text>
            <Text style={s.tierDetail}>0.5 GB storage · 1 project · shared compute · sleeps after inactivity · no SLA</Text>
          </View>
          <View style={[s.tierBox, s.tierBoxRec]}>
            <Text style={s.tierName}>Launch  ★ Recommended</Text>
            <Text style={s.tierPrice}>$19 / mo</Text>
            <Text style={s.tierDetail}>10 GB storage · always-on · daily auto-backup · 99.9% uptime · ~50 users</Text>
          </View>
          <View style={s.tierBox}>
            <Text style={s.tierName}>Scale</Text>
            <Text style={s.tierPrice}>$69 / mo</Text>
            <Text style={s.tierDetail}>50 GB · read replicas · priority support · 100+ concurrent users</Text>
          </View>
        </View>

        {/* App Hosting */}
        <Text style={s.sectionBar}>2. App Hosting — Vercel</Text>
        <View style={s.tierGrid}>
          <View style={s.tierBox}>
            <Text style={s.tierName}>Hobby  (current)</Text>
            <Text style={s.tierPrice}>$0 / mo</Text>
            <Text style={s.tierDetail}>*.vercel.app URL only · limited bandwidth · no custom domain · no team access</Text>
          </View>
          <View style={[s.tierBox, s.tierBoxRec]}>
            <Text style={s.tierName}>Pro  ★ Recommended</Text>
            <Text style={s.tierPrice}>$20 / mo</Text>
            <Text style={s.tierDetail}>Custom domain · 1 TB bandwidth · team seats · analytics · no cold starts</Text>
          </View>
        </View>

        {/* Local Server */}
        <Text style={s.sectionBar}>3. Local Server + Offline Backup — Hostinger VPS</Text>
        <View style={[s.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={s.colName}>KVM 1 VPS</Text>
          <Text style={s.colSub}>1 vCPU · 4 GB RAM · 50 GB NVMe · Lithuania / US DC</Text>
          <Text style={s.colPrice}>~$7 / mo</Text>
        </View>
        <Text style={{ ...s.noteText, marginBottom: 6 }}>
          Runs local Postgres. Syncs to Neon via scheduled pg_dump when internet is available.
        </Text>
        <View style={[s.row, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={s.colName}>KVM 2 VPS  ★ Recommended</Text>
          <Text style={s.colSub}>2 vCPU · 8 GB RAM · 100 GB NVMe · better for full stack</Text>
          <Text style={s.colPrice}>~$14 / mo</Text>
        </View>
        <Text style={s.noteText}>
          Hosts the full ERP (Next.js + Postgres) locally. LAN users work offline; syncs to Neon cloud when internet reconnects.
        </Text>

        {/* Domain */}
        <Text style={s.sectionBar}>4. Domain Name (optional)</Text>
        <View style={[s.row, { borderBottomWidth: 0 }]}>
          <Text style={s.colName}>.com domain (e.g. yardname-erp.com)</Text>
          <Text style={s.colSub}>Via Namecheap, Cloudflare, or Hostinger registrar</Text>
          <Text style={s.colPrice}>~$12 / yr</Text>
        </View>

        {/* Total */}
        <Text style={s.sectionBar}>5. Recommended Monthly Total</Text>
        <View style={s.totalBox}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Neon Launch (cloud database)</Text>
            <Text style={s.totalValue}>$19.00</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Vercel Pro (cloud app hosting)</Text>
            <Text style={s.totalValue}>$20.00</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Hostinger KVM 2 (local server + offline backup)</Text>
            <Text style={s.totalValue}>$14.00</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Domain name (~$12/yr amortized)</Text>
            <Text style={s.totalValue}>$1.00</Text>
          </View>
          <View style={s.divider} />
          <View style={s.totalRow}>
            <Text style={s.grandLabel}>Total / month</Text>
            <Text style={s.grandValue}>~$54 / mo</Text>
          </View>
          <Text style={s.noteText}>
            Annual cost: ~$648/year.  Minimum viable (Neon free + Vercel free, no local server) = $0/mo during testing.
          </Text>
        </View>

        {/* Sync Architecture */}
        <Text style={s.sectionBar}>6. How Offline Sync Works</Text>
        <View style={s.stepRow}>
          <Text style={s.stepNum}>1.</Text>
          <Text style={s.stepText}>Hostinger VPS runs Postgres + Next.js ERP locally — yard users connect via LAN with no internet required.</Text>
        </View>
        <View style={s.stepRow}>
          <Text style={s.stepNum}>2.</Text>
          <Text style={s.stepText}>A scheduled cron job (every hour or on reconnect) runs pg_dump and restores the snapshot to the Neon cloud DB.</Text>
        </View>
        <View style={s.stepRow}>
          <Text style={s.stepNum}>3.</Text>
          <Text style={s.stepText}>Remote users and management access the Vercel-hosted version which reads from Neon cloud DB in real time.</Text>
        </View>
        <View style={s.stepRow}>
          <Text style={s.stepNum}>4.</Text>
          <Text style={s.stepText}>If internet drops, the local VPS keeps all yard operations running. Data syncs automatically when the connection restores.</Text>
        </View>

        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
