import { z } from "zod";

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
  condition: z.enum(["GOOD", "DAMAGED"]),
  damageRemarks: z.string().optional(),
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
});
export type GateOutInput = z.infer<typeof gateOutSchema>;
