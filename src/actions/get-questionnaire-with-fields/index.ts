// actions/get-questionnaire-with-fields/index.ts
"use server";

import { db } from "@/db";
import { questionnairesTable, questionnaireFieldsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";
import { z } from "zod";

const schema = z.object({
  questionnaireId: z.string().uuid(),
});

export const getQuestionnaireWithFields = protectedWithClinicActionClient
  .inputSchema(schema)
  .action(async ({ parsedInput, ctx }) => {
    // Buscar o questionário
    const questionnaire = await db.query.questionnairesTable.findFirst({
      where: eq(questionnairesTable.id, parsedInput.questionnaireId),
    });

    if (!questionnaire) {
      throw new Error("Questionário não encontrado");
    }

    // Verificar se o questionário pertence à clínica do usuário
    if (questionnaire.clinicId !== ctx.user.clinic.id) {
      throw new Error("Questionário não pertence à sua clínica");
    }

    // Buscar os campos do questionário
    const fields = await db.query.questionnaireFieldsTable.findMany({
      where: eq(questionnaireFieldsTable.questionnaireId, questionnaire.id),
      orderBy: (fields, { asc }) => [asc(fields.order)],
    });

    return {
      data: {
        ...questionnaire,
        fields,
      },
    };
  });
