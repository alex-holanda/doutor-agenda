// actions/start-attendance.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

const startAttendanceSchema = z.object({
  attendanceId: z.string().uuid(),
});

// Exporta a action já executada
export const startAttendance = protectedWithClinicActionClient
  .inputSchema(startAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db
      .update(attendancesTable)
      .set({
        status: "in_progress",
        actualStartTime: new Date(),
      })
      .where(eq(attendancesTable.id, parsedInput.attendanceId));

    revalidatePath(`/attendances/${parsedInput.attendanceId}`);
    revalidatePath("/attendances");

    return { success: true };
  });
