import { z } from "zod";

export const movementSchema = z.object({
  containerId: z.string().min(1),
  toLocationId: z.string().min(1),
  reason: z.enum(["YARD_ALLOCATION", "YARD_REPOSITION", "PTI", "REEFER_CONNECTION", "REPAIR", "GATE_OUT"]),
  equipment: z.string().optional(),
  operator: z.string().optional(),
  supervisorName: z.string().optional(),
  completed: z.boolean().optional().default(false),
});
export type MovementInput = z.infer<typeof movementSchema>;
