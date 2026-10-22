import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
import { COMPANY_LOGO_DATA_URL } from "../logo";
import { COMPANY } from "./shared";

/**
 * Equipment Interchange / Receipt (EIR).
 * Modelled on the MEDLOG / Port de Douala interchange receipt supplied by the
 * client: company header, a labelled data grid, a damage check-mark area with
 * container views, and the depot / haulier condition statements.
 */

export type EIRData = {
  qrDataUrl: string;
  // Data grid
  equipmentNo: string; // container number
  moveType: string; // e.g. Empty Received at CY
  sizeType: string; // e.g. 40HC
  dateTime: string; // e.g. 18-Sep-2024 17:56:40
  service: string; // Empty / Loaded
  gatePassNo: string; // EIR / gate pass document number
  carrier: string; // shipping line
  agent: string;
  stackPosition: string;
  bookingNo: string;
  customer: string;
  tareWeight: string;
  payload: string;
  smartContainer: string; // Yes / No
  newEquipmentNo: string;
  transportMode: string; // Truck
  truckNo: string;
  transporter: string;
  driverName: string;
  driverRefNo: string;
  acceptanceRef: string;
  sealType: string;
  sealNumber: string;
  remarks: string;
};

const BORDER = "#374151";
const s = StyleSheet.create({
  page: { paddingTop: 24, paddingBottom: 24, paddingHorizontal: 28, fontSize: 8.5, fontFamily: "Helvetica", color: "#111827" },
  title: { fontSize: 11, fontWeight: 700, textAlign: "center", marginBottom: 8, letterSpacing: 0.5 },

  // Company header
  header: { flexDirection: "row", borderWidth: 1, borderColor: BORDER },
  hLeft: { flexDirection: "row", alignItems: "center", gap: 8, padding: 6, width: "34%", borderRightWidth: 1, borderRightColor: BORDER },
  logo: { width: 40, height: 40, objectFit: "contain" },
  coName: { fontSize: 11, fontWeight: 700, color: COMPANY.brandColor },
  hMid: { padding: 6, width: "46%", borderRightWidth: 1, borderRightColor: BORDER },
  hRight: { padding: 6, width: "20%", alignItems: "center" },
  coMeta: { fontSize: 6.5, color: "#374151", marginBottom: 1 },
  coMetaBold: { fontSize: 7.5, fontWeight: 700, textAlign: "center", marginBottom: 2 },
  qr: { width: 44, height: 44 },
  qrCap: { fontSize: 5, color: "#6B7280", textAlign: "center", marginTop: 1 },

  // Data grid
  grid: { borderWidth: 1, borderTopWidth: 0, borderColor: BORDER },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: BORDER },
  rowLast: { flexDirection: "row" },
  cell: { flexDirection: "row", flex: 1, paddingHorizontal: 4, paddingVertical: 3, borderRightWidth: 1, borderRightColor: BORDER, minHeight: 16 },
  cellLast: { borderRightWidth: 0 },
  cLabel: { fontSize: 7, fontWeight: 700, color: "#111827", width: 74 },
  cColon: { fontSize: 7.5, width: 6 },
  cValue: { fontSize: 7.5, flex: 1 },

  // Damage section
  dmgNote: { fontSize: 7.5, fontWeight: 700, marginTop: 8 },
  dmgCheck: { fontSize: 7.5, marginTop: 2, marginBottom: 3 },
  dmgWrap: { flexDirection: "row", gap: 8, borderWidth: 1, borderColor: BORDER, padding: 8, minHeight: 120 },
  dmgBox: { flex: 1, borderWidth: 0.75, borderColor: "#9CA3AF", alignItems: "center", justifyContent: "center", padding: 4 },
  // Simple container outline suggestion inside each damage box
  contOuter: { width: "88%", height: 54, borderWidth: 1, borderColor: "#9CA3AF", flexDirection: "row" },
  contDoorL: { width: "50%", borderRightWidth: 1, borderRightColor: "#D1D5DB" },
  dmgCap: { fontSize: 6.5, color: "#6B7280", marginTop: 4 },

  // Footer statements
  foot: { flexDirection: "row", borderWidth: 1, borderTopWidth: 0, borderColor: BORDER, minHeight: 90 },
  footL: { width: "50%", padding: 6, borderRightWidth: 1, borderRightColor: BORDER },
  footR: { width: "50%", padding: 6 },
  footTitle: { fontSize: 7.5, fontWeight: 700, marginBottom: 3 },
  footText: { fontSize: 7.5, marginBottom: 2 },
  remarks: { fontSize: 7.5, minHeight: 28, marginBottom: 4 },
  sigLine: { borderTopWidth: 1, borderTopColor: BORDER, marginTop: 24, paddingTop: 2 },
  sigLbl: { fontSize: 7, fontWeight: 700 },
});

function Cell({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <View style={[s.cell, last ? s.cellLast : {}]}>
      <Text style={s.cLabel}>{label}</Text>
      <Text style={s.cColon}>:</Text>
      <Text style={s.cValue}>{value || ""}</Text>
    </View>
  );
}

function DamageView({ caption }: { caption: string }) {
  return (
    <View style={s.dmgBox}>
      <View style={s.contOuter}>
        <View style={s.contDoorL} />
        <View />
      </View>
      <Text style={s.dmgCap}>{caption}</Text>
    </View>
  );
}

export function EquipmentInterchangeReceipt(d: EIRData) {
  return (
    <Document>
      <Page size="A4" style={s.page}>
        <Text style={s.title}>EQUIPMENT INTERCHANGE / RECEIPT</Text>

        {/* Company header */}
        <View style={s.header}>
          <View style={s.hLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={COMPANY_LOGO_DATA_URL} style={s.logo} />
            <Text style={s.coName}>{COMPANY.name.split("—")[0].trim()}</Text>
          </View>
          <View style={s.hMid}>
            <Text style={s.coMetaBold}>{COMPANY.name}</Text>
            <Text style={s.coMeta}>{COMPANY.tagline}</Text>
            <Text style={s.coMeta}>{COMPANY.footerLine2}</Text>
            <Text style={s.coMeta}>{COMPANY.footerLine1}</Text>
            <Text style={s.coMeta}>{COMPANY.footerLine3}</Text>
          </View>
          <View style={s.hRight}>
            {/* eslint-disable-next-line jsx-a11y/alt-text */}
            <Image src={d.qrDataUrl} style={s.qr} />
            <Text style={s.qrCap}>Scan for live document</Text>
          </View>
        </View>

        {/* Data grid */}
        <View style={s.grid}>
          <View style={s.row}>
            <Cell label="Equipment No." value={d.equipmentNo} />
            <Cell label="Move Type" value={d.moveType} />
            <Cell label="Equipment Size/Type" value={d.sizeType} last />
          </View>
          <View style={s.row}>
            <Cell label="Date/Time" value={d.dateTime} />
            <Cell label="Service" value={d.service} />
            <Cell label="Gate Pass No." value={d.gatePassNo} last />
          </View>
          <View style={s.row}>
            <Cell label="Carrier" value={d.carrier} />
            <Cell label="Agent" value={d.agent} />
            <Cell label="Stack Position" value={d.stackPosition} last />
          </View>
          <View style={s.row}>
            <Cell label="Booking No." value={d.bookingNo} />
            <Cell label="Customer" value={d.customer} />
            <Cell label="Tare Weight" value={d.tareWeight} last />
          </View>
          <View style={s.row}>
            <Cell label="Payload" value={d.payload} />
            <Cell label="Smart Container" value={d.smartContainer} />
            <Cell label="New Equipment No." value={d.newEquipmentNo} last />
          </View>
          <View style={s.row}>
            <Cell label="Transport Mode" value={d.transportMode} />
            <Cell label="Truck No" value={d.truckNo} />
            <Cell label="Transporter" value={d.transporter} last />
          </View>
          <View style={s.row}>
            <Cell label="Truck Driver's Name" value={d.driverName} />
            <Cell label="Truck Driver's Ref. No." value={d.driverRefNo} />
            <Cell label="Acceptance Ref" value={d.acceptanceRef} last />
          </View>
          <View style={s.rowLast}>
            <Cell label="Seal Type" value={d.sealType} />
            <Cell label="Seal Number" value={d.sealNumber} />
            <Cell label="" value="" last />
          </View>
        </View>

        {/* Damage check-mark area */}
        <Text style={s.dmgNote}>PLEASE MARK CLEARLY ALL DAMAGES AND DEFICIENCIES, USE CHECK MARK, IF NO EXCEPTIONS.</Text>
        <Text style={s.dmgCheck}>Check Mark:</Text>
        <View style={s.dmgWrap}>
          <DamageView caption="Side / Roof" />
          <DamageView caption="Rear / Doors" />
          <DamageView caption="Front / Underside" />
        </View>

        {/* Condition statements */}
        <View style={s.foot}>
          <View style={s.footL}>
            <Text style={s.footTitle}>Remarks</Text>
            <Text style={s.remarks}>{d.remarks || ""}</Text>
            <Text style={s.footText}>This Equipment was Delivered / Received in Good Condition Except as noted above</Text>
            <View style={s.sigLine}><Text style={s.sigLbl}>For Depot Authority</Text></View>
          </View>
          <View style={s.footR}>
            <Text style={s.footText}>This Equipment was Delivered / Received in Good Condition Except as noted above</Text>
            <View style={s.sigLine}><Text style={s.sigLbl}>For Haulier</Text></View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
