import { Document, Page, Text } from "@react-pdf/renderer";
import { styles, DocumentHeader, Field, CheckboxGroup, SignatureBlock, DocFooter } from "./shared";

export type DamageSurveyData = {
  docNumber: string;
  qrDataUrl: string;
  generatedAt: string;
  containerNumber: string;
  location: string;
  surveyDate: string;
  surveyor: string;
  frontEnd: string;
  rearEnd: string;
  roof: string;
  floor: string;
  leftSide: string;
  rightSide: string;
  severity: "MINOR" | "MODERATE" | "MAJOR";
  photosAttached: boolean;
  repairRecommended: boolean;
  remarks: string;
};

export function DamageSurveyPdf(data: DamageSurveyData) {
  const severityLabel = data.severity === "MINOR" ? "Minor" : data.severity === "MODERATE" ? "Moderate" : "Major";
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <DocumentHeader
          docTitle="Container Damage Survey"
          docNumber={data.docNumber}
          qrDataUrl={data.qrDataUrl}
          generatedAt={data.generatedAt}
        />

        <Field label="Container Number" value={data.containerNumber} />
        <Field label="Location" value={data.location} />
        <Field label="Survey Date" value={data.surveyDate} />
        <Field label="Surveyor" value={data.surveyor} />

        <Text style={styles.sectionTitle}>Damage Details</Text>
        <Field label="Front End" value={data.frontEnd} full />
        <Field label="Rear End" value={data.rearEnd} full />
        <Field label="Roof" value={data.roof} full />
        <Field label="Floor" value={data.floor} full />
        <Field label="Left Side" value={data.leftSide} full />
        <Field label="Right Side" value={data.rightSide} full />

        <CheckboxGroup label="Severity" options={["Minor", "Moderate", "Major"]} selected={severityLabel} />
        <CheckboxGroup
          label="Photographs Attached"
          options={["Yes", "No"]}
          selected={data.photosAttached ? "Yes" : "No"}
        />
        <CheckboxGroup
          label="Repair Recommended"
          options={["Yes", "No"]}
          selected={data.repairRecommended ? "Yes" : "No"}
        />

        <Field label="Remarks" value={data.remarks} full />
        <SignatureBlock leftLabel="Surveyor Signature" rightLabel="" />
        <DocFooter page={1} totalPages={1} />
      </Page>
    </Document>
  );
}
