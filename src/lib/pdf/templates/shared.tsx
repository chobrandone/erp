import { StyleSheet, View, Text, Image } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#5415BC",
    paddingBottom: 10,
    marginBottom: 14,
  },
  companyBlock: { flexDirection: "column" },
  companyName: { fontSize: 14, fontWeight: 700, color: "#5415BC" },
  companyMeta: { fontSize: 8, color: "#6B7280", marginTop: 2 },
  docMetaBlock: { alignItems: "flex-end" },
  docTitle: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  docNumber: { fontSize: 9, color: "#374151" },
  qr: { width: 60, height: 60, marginTop: 6 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#ffffff",
    backgroundColor: "#0080FF",
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 8,
  },
  grid: { flexDirection: "row", flexWrap: "wrap" },
  fieldHalf: { width: "50%", marginBottom: 8, paddingRight: 8 },
  fieldFull: { width: "100%", marginBottom: 8 },
  fieldLabel: { fontSize: 7.5, color: "#6B7280", marginBottom: 2 },
  fieldValue: {
    fontSize: 9.5,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 2,
  },
  photoGrid: { flexDirection: "row", gap: 8, marginTop: 4 },
  photoBox: {
    width: 70,
    height: 50,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  photoLabel: { fontSize: 7, color: "#9CA3AF" },
  signatureRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
  },
  signatureBox: { width: "45%" },
  signatureLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#9CA3AF",
    height: 36,
  },
  signatureLabel: { fontSize: 8, color: "#6B7280", marginTop: 4 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 7,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 6,
  },
});

export function DocumentHeader({
  docTitle,
  docNumber,
  qrDataUrl,
  generatedAt,
}: {
  docTitle: string;
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.companyBlock}>
        <Text style={styles.companyName}>Container Depot ERP</Text>
        <Text style={styles.companyMeta}>Container Storage Park — Yard Management</Text>
        <Text style={styles.companyMeta}>Generated: {generatedAt}</Text>
      </View>
      <View style={styles.docMetaBlock}>
        <Text style={styles.docTitle}>{docTitle}</Text>
        <Text style={styles.docNumber}>Doc No: {docNumber}</Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={qrDataUrl} style={styles.qr} />
      </View>
    </View>
  );
}

export function Field({ label, value, full }: { label: string; value: string; full?: boolean }) {
  return (
    <View style={full ? styles.fieldFull : styles.fieldHalf}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "-"}</Text>
    </View>
  );
}

export function SignatureBlock({ leftLabel, rightLabel }: { leftLabel: string; rightLabel: string }) {
  return (
    <View style={styles.signatureRow}>
      <View style={styles.signatureBox}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>{leftLabel}</Text>
      </View>
      <View style={styles.signatureBox}>
        <View style={styles.signatureLine} />
        <Text style={styles.signatureLabel}>{rightLabel}</Text>
      </View>
    </View>
  );
}

export function PhotoPlaceholders({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.photoGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.photoBox}>
          <Text style={styles.photoLabel}>Photo {i + 1}</Text>
        </View>
      ))}
    </View>
  );
}

export function DocFooter({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <View style={styles.footer}>
      <Text>Container Depot ERP — Confidential</Text>
      <Text>
        Page {page} of {totalPages}
      </Text>
    </View>
  );
}
