import { z } from "zod";

export const ptiRequestSchema = z
  .object({
    // Either pick an existing container (containerId) or enter a new one
    // (containerNumber + containerTypeId). At least one path must be provided.
    containerId: z.string().optional(),
    containerNumber: z.string().optional(),
    containerTypeId: z.string().optional(),
    customerId: z.string().optional(),
    shippingLineId: z.string().optional(),
    priority: z.enum(["NORMAL", "URGENT"]),
    requiredDate: z.string().optional(),
    inspectionType: z.enum(["STANDARD", "SPECIAL", "SMART"]).default("STANDARD"),
    remarks: z.string().optional(),
    requestedBy: z.string().optional(),
    approvedBy: z.string().optional(),
  })
  .refine(
    (d) => (d.containerId && d.containerId.length > 0) || (d.containerNumber && d.containerNumber.trim().length > 0 && d.containerTypeId && d.containerTypeId.length > 0),
    { message: "Select an existing container or enter a container number with its type.", path: ["containerId"] }
  );
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
