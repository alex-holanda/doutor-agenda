import { z } from "zod";

export const addAttendanceSchema = z.object({
  patientId: z.uuid(),
  doctorId: z.uuid(),
  type: z.enum(["walk_in", "emergency"]),
  chiefComplaint: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
