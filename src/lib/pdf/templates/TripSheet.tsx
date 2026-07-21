import { Document, Page, View, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, SignatureBlock, DocFooter } from "./shared";

export type TripSheetData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  plate: string;
  vehicle: string;
  driverName: string;
  driverPhone: string;
  cargoType: string;
  containerNumber: string;
  cargoDescription: string;
  origin: string;
  destination: string;
  departure: string;
  expectedReturn: string;
  returnTime: string;
  status: string;
  remarks: string;
};

export function TripSheet(data: TripSheetData) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="BON DE MISSION — Feuille de route"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
          qrCaption="Scanner pour le document en ligne"
        />

        <Text style={styles.sectionTitle}>VÉHICULE & CHAUFFEUR</Text>
        <View style={styles.grid}>
          <Field label="Immatriculation" value={data.plate} />
          <Field label="Véhicule" value={data.vehicle} />
          <Field label="Chauffeur" value={data.driverName} />
          <Field label="Téléphone chauffeur" value={data.driverPhone} />
        </View>

        <Text style={styles.sectionTitle}>CHARGEMENT</Text>
        <View style={styles.grid}>
          <Field label="Type de chargement" value={data.cargoType} />
          <Field label="N° Conteneur / Équipement" value={data.containerNumber} />
          <Field label="Description" value={data.cargoDescription} full />
        </View>

        <Text style={styles.sectionTitle}>ITINÉRAIRE</Text>
        <View style={styles.grid}>
          <Field label="Origine" value={data.origin} />
          <Field label="Destination" value={data.destination} />
          <Field label="Départ" value={data.departure} />
          <Field label="Retour prévu" value={data.expectedReturn} />
          <Field label="Retour effectif" value={data.returnTime} />
          <Field label="Statut" value={data.status} />
        </View>

        <Field label="Remarques" value={data.remarks} full />

        <Text style={styles.sectionTitle}>VISAS</Text>
        <SignatureBlock leftLabel="Responsable du Parc" rightLabel="Chauffeur" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
