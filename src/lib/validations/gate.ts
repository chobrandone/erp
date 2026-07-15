import { z } from "zod";

// Shared RTC / Port de Douala EIR (procès-verbal) optional fields.
const eirFields = {
  navire: z.string().optional(),
  voyage: z.string().optional(),
  statut: z.enum(["FCL", "LCL"]).optional(),
  pod: z.string().optional(),
  acconier: z.string().optional(),
  transitaire: z.string().optional(),
  marchandise: z.string().optional(),
  oog: z.boolean().optional().default(false),
  imdg: z.string().optional(),
  region: z.string().optional(),
  gatePost: z.string().optional(),
  tempGate: z.coerce.number().optional(),
  isoCode: z.string().optional(),
  sealNumber2: z.string().optional(),
  documentType: z.enum(["BL", "BEE"]).optional(),
  documentNumber: z.string().optional(),
  freeDays: z.coerce.number().int().optional(),
};

export const gateInSchema = z.object({
  containerNumber: z.string().min(4),
  containerTypeId: z.string().min(1),
  shippingLineId: z.string().optional(),
  customerId: z.string().optional(),
  truckPlate: z.string().min(1),
  driverName: z.string().min(1),
  driverId: z.string().optional(),
  sealNumber: z.string().optional(),
  grossWeightKg: z.coerce.number().optional(),
  status: z.enum(["EMPTY", "FULL"]).default("FULL"),
  condition: z.enum(["GOOD", "DAMAGED"]),
  damageRemarks: z.string().optional(),
  photosAttached: z.boolean().optional().default(false),
  remarks: z.string().optional(),
  ...eirFields,
});
export type GateInInput = z.infer<typeof gateInSchema>;

export const gateOutSchema = z.object({
  containerId: z.string().min(1),
  destination: z.string().min(1),
  releaseOrderNo: z.string().min(1),
  truckPlate: z.string().min(1),
  driverName: z.string().min(1),
  condition: z.enum(["GOOD", "DAMAGED"]),
  damageRemarks: z.string().optional(),
  remarks: z.string().optional(),
  ...eirFields,
});
export type GateOutInput = z.infer<typeof gateOutSchema>;
