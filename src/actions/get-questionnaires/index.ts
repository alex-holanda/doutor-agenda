// actions/get-questionnaires/index.ts
"use server";

import { db } from "@/db";
import { questionnairesTable, questionnaireFieldsTable } from "@/db/schema";
import { protectedWithClinicActionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

export const getQuestionnaires = protectedWithClinicActionClient.action(
  async ({ ctx }) => {
    // Buscar todos os questionários da clínica
    const questionnaires = await db
      .select()
      .from(questionnairesTable)
      .where(eq(questionnairesTable.clinicId, ctx.user.clinic.id));

    // Para cada questionário, buscar seus campos
    const questionnairesWithFields = [];
    for (const questionnaire of questionnaires) {
      const fields = await db
        .select()
        .from(questionnaireFieldsTable)
        .where(eq(questionnaireFieldsTable.questionnaireId, questionnaire.id))
        .orderBy(questionnaireFieldsTable.order);

      questionnairesWithFields.push({
        ...questionnaire,
        fields,
      });
    }

    return { questionnairesWithFields };
  },
);
