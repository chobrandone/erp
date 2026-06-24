import { z } from "zod";

export const ptiRequestSchema = z.object({
  containerId: z.string().min(1),
  priority: z.enum(["NORMAL", "URGENT"]),
});
export type PTIRequestInput = z.infer<typeof ptiRequestSchema>;

export const ptiChecklistItemSchema = z.object({
  key: z.string(),
  label: z.string(),
  result: z.enum(["PASS", "FAIL"]),
});

export const ptiInspectionSchema = z.object({
  ptiRequestId: z.string().min(1),
  checklist: z.array(ptiChecklistItemSchema).min(1),
  remarks: z.string().optional(),
});
export type PTIInspectionInput = z.infer<typeof ptiInspectionSchema>;

export const PTI_CHECKLIST_ITEMS = [
  { key: "controllerTest", label: "Controller Test" },
  { key: "compressorTest", label: "Compressor Test" },
  { key: "fanMotorTest", label: "Fan Motor Test" },
  { key: "temperatureTest", label: "Temperature Test" },
  { key: "doorSealInspection", label: "Door Seal Inspection" },
  { key: "structuralInspection", label: "Structural Inspection" },
] as const;
