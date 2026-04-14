"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { appointmentsTable, attendancesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const cancelAppointment = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const appointment = await db.query.appointmentsTable.findFirst({
      where: eq(appointmentsTable.id, parsedInput.id),
    });
    if (!appointment) {
      throw new Error("Agendamento não encontrado");
    }
    if (appointment.clinicId !== ctx.user.clinic.id) {
      throw new Error("Agendamento não encontrado");
    }

    const attendance = await db.query.attendancesTable.findFirst({
      where: eq(attendancesTable.appointmentId, parsedInput.id),
    });

    if (attendance && attendance.status !== "completed") {
      await db
        .update(attendancesTable)
        .set({ status: "cancelled" })
        .where(eq(attendancesTable.id, attendance.id));
    }

    await db
      .update(appointmentsTable)
      .set({ status: "cancelled" })
      .where(eq(appointmentsTable.id, parsedInput.id));
    revalidatePath("/appointments");
    revalidatePath("/attendances");
  });
