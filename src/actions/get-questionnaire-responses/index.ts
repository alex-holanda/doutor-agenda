// actions/get-questionnaire-responses/index.ts
"use server";

import { db } from "@/db";
import { questionnaireResponsesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  attendanceId: z.string().uuid(),
});

export async function getQuestionnaireResponses(data: z.infer<typeof schema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const validated = schema.parse(data);

  const responses = await db.query.questionnaireResponsesTable.findMany({
    where: eq(questionnaireResponsesTable.attendanceId, validated.attendanceId),
  });

  return { data: responses || [] };
}
