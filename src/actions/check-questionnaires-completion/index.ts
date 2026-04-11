// actions/check-questionnaires-completion/index.ts
"use server";

import { db } from "@/db";
import { questionnaireResponsesTable, questionnairesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  attendanceId: z.string().uuid(),
});

export async function checkQuestionnairesCompletion(
  data: z.infer<typeof schema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const validated = schema.parse(data);

  // Buscar todos os questionários da clínica
  const questionnaires = await db.query.questionnairesTable.findMany({
    where: eq(questionnairesTable.clinicId, session.user.clinic?.id!),
  });

  // Buscar respostas já preenchidas
  const responses = await db.query.questionnaireResponsesTable.findMany({
    where: eq(questionnaireResponsesTable.attendanceId, validated.attendanceId),
  });

  // Verificar quais questionários não têm resposta
  const respondedQuestionnaireIds = new Set(
    responses.map((r) => r.questionnaireId),
  );
  const pendingQuestionnaires = questionnaires.filter(
    (q) => !respondedQuestionnaireIds.has(q.id),
  );

  return {
    hasPending: pendingQuestionnaires.length > 0,
    pendingQuestionnaires: pendingQuestionnaires.map((q) => q.name),
  };
}
