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

export const startAttendance = protectedWithClinicActionClient
  .inputSchema(startAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    const attendance = await db.query.attendancesTable.findFirst({
      where: eq(attendancesTable.id, parsedInput.attendanceId),
    });

    if (!attendance) {
      throw new Error("Atendimento não encontrado");
    }

    if (attendance.status === "cancelled") {
      throw new Error("Atendimento cancelado não pode ser iniciado");
    }

    if (attendance.status === "completed") {
      throw new Error("Atendimento já foi finalizado");
    }

    if (attendance.status === "in_progress") {
      throw new Error("Atendimento já está em andamento");
    }

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
