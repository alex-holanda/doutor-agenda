"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { db } from "@/db";
import { professionalsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";

export const deleteProfessional = protectedWithClinicActionClient
  .schema(
    z.object({
      id: z.string().uuid(),
    }),
  )
  .action(async ({ parsedInput, ctx }) => {
    const professional = await db.query.professionalsTable.findFirst({
      where: eq(professionalsTable.id, parsedInput.id),
    });
    if (!professional) {
      throw new Error("Profissional não encontrado");
    }
    if (professional.clinicId !== ctx.user.clinic.id) {
      throw new Error("Profissional não encontrado");
    }
    await db.delete(professionalsTable).where(eq(professionalsTable.id, parsedInput.id));
    revalidatePath("/professionals");
  });
