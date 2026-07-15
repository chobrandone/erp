import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { COMPANY_LOGO_DATA_URL } from "../logo";
import { COMPANY } from "./shared";

/**
 * French EIR — PROCÈS-VERBAL DE PRISE EN CHARGE / LIVRAISON.
 * Faithful to the RTC / Port de Douala paper form supplied by the client.
 * Printed as two identical copies on one A4 page (Exemplaire Client / Exemplaire Dépôt).
 */

export type EIRData = {
  mode: "ENTREE" | "SORTIE"; // PRISE EN CHARGE (in) | LIVRAISON (out)
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  region: string;
  dateEntree: string;
  dateSortie: string;
  statut: string; // FCL / LCL
  containerNumber: string;
  navire: string;
  voyage: string;
  documentType: string; // BL / BEE
  documentNumber: string;
  armementBl: string; // shipping line
  poids: string; // gross weight
  pod: string;
  tare: string;
  lieu: string; // yard position
  acconier: string;
  codeIso: string;
  immat: string; // truck plate
  destFinale: string;
  plomb1: string;
  plomb2: string;
  marchandise: string;
  reefer: boolean;
  temp: string;
  oog: boolean;
  imdg: string;
  transitaire: string;
  transporteur: string;
  condition: "GOOD" | "DAMAGED";
  damageRemarks: string;
  gatePost: string; // VU BST POSTE N
};

const s = StyleSheet.create({
  page: { paddingTop: 18, paddingBottom: 18, paddingHorizontal: 22, fontSize: 7.5, fontFamily: "Helvetica", color: "#111827" },
  copy: { borderWidth: 1, borderColor: "#1F5FB0", padding: 8, marginBottom: 6 },
  cutLine: { borderTopWidth: 1, borderTopColor: "#9CA3AF", borderStyle: "dashed", marginVertical: 4 },
  cutText: { fontSize: 6, color: "#9CA3AF", textAlign: "center", marginBottom: 4 },

  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: "#1F5FB0", paddingBottom: 4, marginBottom: 4 },
  headLeft: { flexDirection: "row", alignItems: "center", gap: 6, maxWidth: "58%" },
  logo: { width: 34, height: 34, objectFit: "contain" },
  coName: { fontSize: 9, fontWeight: 700, color: "#1F5FB0" },
  coMeta: { fontSize: 6, color: "#6B7280", maxWidth: 190 },
  headRight: { alignItems: "flex-end" },
  qr: { width: 42, height: 42 },
  qrCap: { fontSize: 5, color: "#6B7280", maxWidth: 60, textAlign: "center" },

  title: { fontSize: 8.5, fontWeight: 700, textAlign: "center", color: "#111827", marginBottom: 1 },
  subtitle: { fontSize: 7, textAlign: "center", color: "#374151", marginBottom: 4 },
  copyTag: { fontSize: 6, color: "#1F5FB0", textAlign: "right", marginBottom: 2 },

  topRow: { flexDirection: "row", flexWrap: "wrap", borderWidth: 0.5, borderColor: "#9CA3AF", marginBottom: 3 },
  topCell: { borderRightWidth: 0.5, borderRightColor: "#9CA3AF", paddingHorizontal: 3, paddingVertical: 2 },

  grid: { flexDirection: "row", flexWrap: "wrap" },
  cell: { width: "25%", paddingRight: 4, marginBottom: 3 },
  cellWide: { width: "50%", paddingRight: 4, marginBottom: 3 },
  lbl: { fontSize: 5.5, color: "#6B7280" },
  val: { fontSize: 7.5, color: "#111827", borderBottomWidth: 0.5, borderBottomColor: "#D1D5DB", paddingBottom: 1, minHeight: 9 },

  sectionBar: { fontSize: 6.5, fontWeight: 700, color: "#fff", backgroundColor: "#1F5FB0", paddingHorizontal: 4, paddingVertical: 1.5, marginTop: 2, marginBottom: 3 },

  dmgWrap: { flexDirection: "row", gap: 4, marginBottom: 3 },
  dmgBox: { flex: 1, borderWidth: 0.5, borderColor: "#9CA3AF", minHeight: 26, padding: 2 },
  dmgTitle: { fontSize: 5.5, color: "#374151", fontWeight: 700, textAlign: "center" },

  flags: { flexDirection: "row", gap: 10, marginBottom: 3 },
  flag: { flexDirection: "row", alignItems: "center", gap: 3 },
  box: { width: 8, height: 8, borderWidth: 0.5, borderColor: "#374151", alignItems: "center", justifyContent: "center" },
  boxChk: { backgroundColor: "#1F5FB0", borderColor: "#1F5FB0" },
  mark: { fontSize: 6, color: "#fff", fontWeight: 700 },
  flagLbl: { fontSize: 6.5 },

  sigRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  sigBox: { width: "31%", alignItems: "center" },
  sigLine: { borderTopWidth: 0.5, borderTopColor: "#6B7280", width: "100%", marginTop: 16 },
  sigLbl: { fontSize: 6, color: "#374151", marginTop: 1, fontWeight: 700 },
  stamp: { borderWidth: 0.5, borderColor: "#1F5FB0", borderStyle: "dashed", paddingHorizontal: 4, paddingVertical: 8, alignItems: "center", justifyContent: "center" },
  stampTxt: { fontSize: 6, color: "#1F5FB0", fontWeight: 700 },
});

function Chk({ on }: { on: boolean }) {
  return (
    <View style={[s.box, on ? s.boxChk : {}]}>{on && <Text style={s.mark}>X</Text>}</View>
  );
}

function C({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <View style={wide ? s.cellWide : s.cell}>
      <Text style={s.lbl}>{label}</Text>
      <Text style={s.val}>{value || "-"}</Text>
    </View>
  );
}

function EIRCopy({ d, copyTag }: { d: EIRData; copyTag: string }) {
  const title =
    d.mode === "ENTREE"
      ? "PROCÈS-VERBAL DE PRISE EN CHARGE"
      : "PROCÈS-VERBAL DE LIVRAISON";
  return (
    <View style={s.copy}>
      <View style={s.head}>
        <View style={s.headLeft}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={COMPANY_LOGO_DATA_URL} style={s.logo} />
          <View>
            <Text style={s.coName}>{COMPANY.name}</Text>
            <Text style={s.coMeta}>{COMPANY.tagline}</Text>
          </View>
        </View>
        <View style={s.headRight}>
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <Image src={d.qrDataUrl} style={s.qr} />
          <Text style={s.qrCap}>Scanner pour le document en ligne</Text>
        </View>
      </View>

      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>LIVRAISON PLEIN IMPORT SUR CAMION</Text>
      <Text style={s.copyTag}>{copyTag}  —  N° EIR : {d.docNumber}</Text>

      {/* Top identity row */}
      <View style={s.grid}>
        <C label="N° EIR" value={d.docNumber} />
        <C label="RÉGION" value={d.region} />
        <C label="DATE ENTRÉE" value={d.dateEntree} />
        <C label="DATE SORTIE" value={d.dateSortie} />
        <C label="STATUT" value={d.statut} />
        <C label="N° CONTENEUR" value={d.containerNumber} />
        <C label="CODE ISO" value={d.codeIso} />
        <C label="NAVIRE" value={d.navire} />
      </View>

      <Text style={s.sectionBar}>INFORMATIONS DOCUMENTAIRES</Text>
      <View style={s.grid}>
        <C label="VGE (Voyage)" value={d.voyage} />
        <C label="DOCUMENT" value={`${d.documentType} ${d.documentNumber}`.trim()} />
        <C label="ARMEMENT BL" value={d.armementBl} />
        <C label="POD" value={d.pod} />
        <C label="ACCONIER" value={d.acconier} />
        <C label="TRANSITAIRE" value={d.transitaire} />
        <C label="TRANSPORTEUR" value={d.transporteur} />
        <C label="DEST. FINALE" value={d.destFinale} />
      </View>

      <Text style={s.sectionBar}>CONTENEUR & MARCHANDISE</Text>
      <View style={s.grid}>
        <C label="POIDS (kg)" value={d.poids} />
        <C label="TARE (kg)" value={d.tare} />
        <C label="LIEU / POSITION" value={d.lieu} />
        <C label="N° IMMAT (Camion)" value={d.immat} />
        <C label="N° PLOMB 1" value={d.plomb1} />
        <C label="N° PLOMB 2" value={d.plomb2} />
        <C label="TEMP (Reefer)" value={d.reefer ? d.temp : "-"} />
        <C label="IMDG" value={d.imdg} />
        <C label="MARCHANDISE" value={d.marchandise} wide />
      </View>

      <View style={s.flags}>
        <View style={s.flag}><Chk on={d.reefer} /><Text style={s.flagLbl}>REEFER (FRIGO)</Text></View>
        <View style={s.flag}><Chk on={d.oog} /><Text style={s.flagLbl}>OOG (Hors gabarit)</Text></View>
        <View style={s.flag}><Chk on={d.statut.toUpperCase() === "FCL"} /><Text style={s.flagLbl}>FCL</Text></View>
        <View style={s.flag}><Chk on={d.statut.toUpperCase() === "LCL"} /><Text style={s.flagLbl}>LCL</Text></View>
      </View>

      <Text style={s.sectionBar}>DOMMAGES CONSTATÉS À L&apos;ENTRÉE SUR TERMINAL</Text>
      <View style={s.dmgWrap}>
        {["HAUT", "AVANT", "DROIT", "GAUCHE", "ARRIÈRE"].map((p) => (
          <View key={p} style={s.dmgBox}>
            <Text style={s.dmgTitle}>{p}</Text>
          </View>
        ))}
      </View>
      <View style={s.grid}>
        <C label="ÉTAT GÉNÉRAL" value={d.condition === "GOOD" ? "BON ÉTAT" : "ENDOMMAGÉ"} />
        <C label="OBSERVATIONS / DOMMAGES" value={d.damageRemarks} wide />
      </View>

      <View style={s.sigRow}>
        <View style={s.sigBox}>
          <View style={s.sigLine} />
          <Text style={s.sigLbl}>R.T.C.</Text>
        </View>
        <View style={s.sigBox}>
          <View style={s.sigLine} />
          <Text style={s.sigLbl}>ACCONIER</Text>
        </View>
        <View style={s.sigBox}>
          <View style={s.stamp}>
            <Text style={s.stampTxt}>VU BST</Text>
            <Text style={s.stampTxt}>{d.gatePost || "POSTE __"}</Text>
          </View>
          <Text style={s.sigLbl}>CACHET PORTE</Text>
        </View>
      </View>
    </View>
  );
}

export function ProcesVerbalEIR(d: EIRData) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <EIRCopy d={d} copyTag="EXEMPLAIRE CLIENT" />
        <Text style={s.cutText}>— — — — — — — — — — —  découper ici  — — — — — — — — — — —</Text>
        <EIRCopy d={d} copyTag="EXEMPLAIRE DÉPÔT" />
      </Page>
    </Document>
  );
}
