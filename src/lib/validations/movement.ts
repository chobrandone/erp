import { z } from "zod";

export const movementSchema = z.object({
  containerId: z.string().min(1),
  toLocationId: z.string().min(1),
  reason: z.enum(["YARD_OPTIMIZATION", "GATE_OUT_PREP", "INSPECTION", "REPAIR"]),
  equipment: z.string().optional(),
});
export type MovementInput = z.infer<typeof movementSchema>;
