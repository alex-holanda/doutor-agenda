// actions/complete-attendance/index.ts
"use server";

import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  attendanceId: z.string().uuid(),
});

export async function completeAttendance(data: z.infer<typeof schema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const validated = schema.parse(data);

  await db
    .update(attendancesTable)
    .set({
      status: "completed",
      actualEndTime: new Date(),
    })
    .where(eq(attendancesTable.id, validated.attendanceId));

  revalidatePath(`/attendances/${validated.attendanceId}`);
  revalidatePath("/attendances");

  return { success: true };
}
