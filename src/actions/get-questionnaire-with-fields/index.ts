// actions/get-questionnaire-with-fields/index.ts
"use server";

import { db } from "@/db";
import { questionnairesTable, questionnaireFieldsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const schema = z.object({
  questionnaireId: z.string().uuid(),
});

export async function getQuestionnaireWithFields(data: z.infer<typeof schema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const validated = schema.parse(data);

  // Buscar o questionário
  const questionnaire = await db.query.questionnairesTable.findFirst({
    where: eq(questionnairesTable.id, validated.questionnaireId),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  // Buscar os campos do questionário
  const fields = await db.query.questionnaireFieldsTable.findMany({
    where: eq(questionnaireFieldsTable.questionnaireId, questionnaire.id),
    orderBy: (fields, { asc }) => [asc(fields.order)],
  });

  // Retornar no formato correto
  return {
    data: {
      ...questionnaire,
      fields,
    },
  };
}
