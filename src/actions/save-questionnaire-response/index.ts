// actions/save-questionnaire-response/index.ts
"use server";

import { db } from "@/db";
import { questionnaireResponsesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  attendanceId: z.string().uuid(),
  questionnaireId: z.string().uuid(),
  responseData: z.record(z.string(), z.any()),
});

export async function saveQuestionnaireResponse(data: z.infer<typeof schema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const validated = schema.parse(data);

  const existingResponse = await db.query.questionnaireResponsesTable.findFirst(
    {
      where: and(
        eq(questionnaireResponsesTable.attendanceId, validated.attendanceId),
        eq(
          questionnaireResponsesTable.questionnaireId,
          validated.questionnaireId,
        ),
      ),
    },
  );

  if (existingResponse) {
    await db
      .update(questionnaireResponsesTable)
      .set({
        responseData: validated.responseData,
        updatedAt: new Date(),
      })
      .where(eq(questionnaireResponsesTable.id, existingResponse.id));
  } else {
    await db.insert(questionnaireResponsesTable).values({
      attendanceId: validated.attendanceId,
      questionnaireId: validated.questionnaireId,
      answeredBy: "doctor",
      answeredById: session.user.id,
      responseData: validated.responseData,
      completedAt: new Date(),
    });
  }

  revalidatePath(`/attendances/${validated.attendanceId}`);

  return { success: true };
}
