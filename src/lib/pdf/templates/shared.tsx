import { StyleSheet, View, Text, Image } from "@react-pdf/renderer";
import { COMPANY_LOGO_DATA_URL } from "../logo";

// NS SARL — official company identity (from client letterhead). Used on every document.
export const COMPANY = {
  name: "NÉGOCE & SERVICES — N.S. SARL",
  tagline: "Transport · Logistique · Manutention · Stockage de Conteneurs — Port de Douala",
  footerLine1: "Sarl au Cap social de 1 000 000 Frs CFA   RC N° RC / OLN / 2005 / B / 2649",
  footerLine2: "B.P. : 11091 Douala - Cameroun   Tél.: (237) 233 43 20 60   E-mail : negoser@yahoo.fr",
  footerLine3: "BICEC: 06808 6924140800163 • N° Contribuable : M120400018599 D",
  brandColor: "#1F5FB0",
};

export const styles = StyleSheet.create({
  page: {
    padding: 32,
    paddingBottom: 56,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 2,
    borderBottomColor: "#1F5FB0",
    paddingBottom: 10,
    marginBottom: 14,
  },
  companyBlock: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: "62%" },
  logo: { width: 46, height: 46, objectFit: "contain" },
  companyText: { flexDirection: "column" },
  companyName: { fontSize: 12, fontWeight: 700, color: "#1F5FB0" },
  companyMeta: { fontSize: 7, color: "#6B7280", marginTop: 2, maxWidth: 230 },
  docMetaBlock: { alignItems: "flex-end" },
  docTitle: { fontSize: 12, fontWeight: 700, marginBottom: 4 },
  docNumber: { fontSize: 9, color: "#374151" },
  qr: { width: 62, height: 62, marginTop: 4 },
  qrCaption: { fontSize: 6, color: "#6B7280", textAlign: "center", marginTop: 1, maxWidth: 70 },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: "#ffffff",
    backgroundColor: "#1F5FB0",
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
    bottom: 18,
    left: 32,
    right: 32,
    flexDirection: "column",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#1F5FB0",
    paddingTop: 5,
  },
  footerLine: { fontSize: 6.5, color: "#6B7280", textAlign: "center", marginBottom: 1 },
  footerPage: { fontSize: 6.5, color: "#9CA3AF", marginTop: 2 },
  checkboxGroupWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2, marginBottom: 8 },
  checkboxOption: { flexDirection: "row", alignItems: "center", gap: 4 },
  checkboxBox: {
    width: 9,
    height: 9,
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxBoxChecked: { backgroundColor: "#5415BC", borderColor: "#5415BC" },
  checkboxMark: { fontSize: 7, color: "#fff", fontWeight: 700 },
  checkboxOptionLabel: { fontSize: 9 },
});

export function DocumentHeader({
  docTitle,
  docNumber,
  qrDataUrl,
  generatedAt,
  qrCaption = "Scan for live document",
}: {
  docTitle: string;
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  qrCaption?: string;
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.companyBlock}>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={COMPANY_LOGO_DATA_URL} style={styles.logo} />
        <View style={styles.companyText}>
          <Text style={styles.companyName}>{COMPANY.name}</Text>
          <Text style={styles.companyMeta}>{COMPANY.tagline}</Text>
          <Text style={styles.companyMeta}>Généré le : {generatedAt}</Text>
        </View>
      </View>
      <View style={styles.docMetaBlock}>
        <Text style={styles.docTitle}>{docTitle}</Text>
        <Text style={styles.docNumber}>N° Doc : {docNumber}</Text>
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <Image src={qrDataUrl} style={styles.qr} />
        <Text style={styles.qrCaption}>{qrCaption}</Text>
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

export function CheckboxGroup({
  label,
  options,
  selected,
}: {
  label?: string;
  options: string[];
  selected: string;
}) {
  return (
    <View style={styles.fieldFull}>
      {label && <Text style={styles.fieldLabel}>{label}</Text>}
      <View style={styles.checkboxGroupWrap}>
        {options.map((opt) => {
          const checked = opt === selected;
          return (
            <View key={opt} style={styles.checkboxOption}>
              <View style={[styles.checkboxBox, checked ? styles.checkboxBoxChecked : {}]}>
                {checked && <Text style={styles.checkboxMark}>X</Text>}
              </View>
              <Text style={styles.checkboxOptionLabel}>{opt}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function DocFooter({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerLine}>{COMPANY.footerLine1}</Text>
      <Text style={styles.footerLine}>{COMPANY.footerLine2}</Text>
      <Text style={styles.footerLine}>{COMPANY.footerLine3}</Text>
      <Text style={styles.footerPage}>
        Page {page} / {totalPages}
      </Text>
    </View>
  );
}
