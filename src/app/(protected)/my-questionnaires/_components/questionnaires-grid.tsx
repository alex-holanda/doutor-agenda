// src/actions/my-questionnaire/index.ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  doctorQuestionnairesTable,
  questionnaireTemplatesTable,
  questionnaireTemplateFieldsTable,
  doctorsTable,
  questionnaireResponsesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

const doctorQuestionnaireSchema = z.object({
  templateId: z.string().uuid(),
  name: z.string().min(1, "Nome é obrigatório"),
});

// Criar questionário (busca o médico automaticamente pelo usuário logado)
export async function createDoctorQuestionnaire(
  data: z.infer<typeof doctorQuestionnaireSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const validated = doctorQuestionnaireSchema.parse(data);

  // Buscar médico pelo user ID do usuário logado
  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, session.user.id),
  });

  if (!doctor) {
    throw new Error(
      "Médico não encontrado. Verifique se seu usuário está vinculado a um médico.",
    );
  }

  const template = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, validated.templateId),
  });

  if (!template) {
    throw new Error("Template não encontrado");
  }

  // Criar questionário personalizado
  await db.insert(doctorQuestionnairesTable).values({
    doctorId: doctor.id,
    templateId: validated.templateId,
    name: validated.name,
    isActive: true,
  });

  // Incrementar contador de uso do template
  await db
    .update(questionnaireTemplatesTable)
    .set({
      usageCount: (template.usageCount || 0) + 1,
      updatedAt: new Date(),
    })
    .where(eq(questionnaireTemplatesTable.id, validated.templateId));

  revalidatePath("/my-questionnaires");
  return { success: true };
}

// Listar meus questionários
export async function getMyQuestionnaires() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  // Buscar médico pelo user ID
  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, session.user.id),
  });

  if (!doctor) {
    return [];
  }

  const questionnaires = await db.query.doctorQuestionnairesTable.findMany({
    where: and(
      eq(doctorQuestionnairesTable.doctorId, doctor.id),
      eq(doctorQuestionnairesTable.isActive, true),
    ),
    orderBy: [desc(doctorQuestionnairesTable.createdAt)],
  });

  // Buscar dados do template e campos para cada questionário
  const questionnairesWithDetails = await Promise.all(
    questionnaires.map(async (q) => {
      const template = await db.query.questionnaireTemplatesTable.findFirst({
        where: eq(questionnaireTemplatesTable.id, q.templateId),
      });

      const templateFields =
        await db.query.questionnaireTemplateFieldsTable.findMany({
          where: eq(questionnaireTemplateFieldsTable.templateId, q.templateId),
          with: {
            field: true,
          },
          orderBy: (fields, { asc }) => [asc(fields.order)],
        });

      // Buscar última resposta (se houver)
      const lastResponse = await db.query.questionnaireResponsesTable.findFirst(
        {
          where: eq(questionnaireResponsesTable.doctorQuestionnaireId, q.id),
          orderBy: [desc(questionnaireResponsesTable.createdAt)],
        },
      );

      return {
        ...q,
        template: {
          ...template,
          fields: templateFields.map((tf) => tf.field),
        },
        lastUsed: lastResponse?.completedAt || null,
        usageCount: lastResponse ? 1 : 0,
      };
    }),
  );

  return questionnairesWithDetails;
}

// Obter questionário por ID
export async function getQuestionnaireById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const questionnaire = await db.query.doctorQuestionnairesTable.findFirst({
    where: eq(doctorQuestionnairesTable.id, id),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  const template = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, questionnaire.templateId),
  });

  const templateFields =
    await db.query.questionnaireTemplateFieldsTable.findMany({
      where: eq(
        questionnaireTemplateFieldsTable.templateId,
        questionnaire.templateId,
      ),
      with: {
        field: true,
      },
      orderBy: (fields, { asc }) => [asc(fields.order)],
    });

  return {
    ...questionnaire,
    template: {
      ...template,
      fields: templateFields.map((tf) => tf.field),
    },
  };
}

// Atualizar questionário
export async function updateQuestionnaire(id: string, data: { name: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se o questionário pertence ao médico
  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, session.user.id),
  });

  if (!doctor) {
    throw new Error("Médico não encontrado");
  }

  const questionnaire = await db.query.doctorQuestionnairesTable.findFirst({
    where: and(
      eq(doctorQuestionnairesTable.id, id),
      eq(doctorQuestionnairesTable.doctorId, doctor.id),
    ),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  await db
    .update(doctorQuestionnairesTable)
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(doctorQuestionnairesTable.id, id));

  revalidatePath("/my-questionnaires");
  return { success: true };
}

// Excluir questionário (soft delete)
export async function deleteQuestionnaire(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se o questionário pertence ao médico
  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, session.user.id),
  });

  if (!doctor) {
    throw new Error("Médico não encontrado");
  }

  const questionnaire = await db.query.doctorQuestionnairesTable.findFirst({
    where: and(
      eq(doctorQuestionnairesTable.id, id),
      eq(doctorQuestionnairesTable.doctorId, doctor.id),
    ),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  await db
    .update(doctorQuestionnairesTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(doctorQuestionnairesTable.id, id));

  revalidatePath("/my-questionnaires");
  return { success: true };
}
