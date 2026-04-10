// actions/complete-attendance/index.ts
"use server";

import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const schema = z.object({
  attendanceId: z.string().uuid(),
});

export const completeAttendance = protectedWithClinicActionClient
  .inputSchema(schema)
  .action(async ({ parsedInput }) => {
    await db
      .update(attendancesTable)
      .set({
        status: "completed",
        actualEndTime: new Date(),
      })
      .where(eq(attendancesTable.id, parsedInput.attendanceId));

    revalidatePath(`/attendances/${parsedInput.attendanceId}`);
    revalidatePath("/attendances");

    return { success: true, message: "Atendimento finalizado com sucesso" };
  });
