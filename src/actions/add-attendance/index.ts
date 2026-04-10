"use server";

import dayjs from "dayjs";
import { revalidatePath } from "next/cache";

import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { addAttendanceSchema } from "./schema";

export const addAttendance = protectedWithClinicActionClient
  .inputSchema(addAttendanceSchema)
  .action(async ({ parsedInput, ctx }) => {
    await db.insert(attendancesTable).values({
      clinicId: ctx.user.clinic.id,
      patientId: parsedInput.patientId,
      doctorId: parsedInput.doctorId,
      type: parsedInput.type,
      chiefComplaint: parsedInput.chiefComplaint || null,
      notes: parsedInput.notes || null,
      status: "waiting",
      scheduledStartTime: dayjs().toDate(), // horário atual
    });

    revalidatePath("/attendances");
    revalidatePath("/dashboard");
  });
