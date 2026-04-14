"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  questionnairesTable,
  questionnaireTemplatesTable,
  questionnaireTemplateFieldsTable,
  doctorsTable,
  questionnaireResponsesTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

const questionnaireSchema = z.object({
  doctorId: z.string().min(1, "Selecione um médico"),
  templateId: z.string().uuid("Selecione um template"),
  name: z.string().min(1, "Nome é obrigatório"),
});

export async function createQuestionnaire(
  data: z.infer<typeof questionnaireSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const validated = questionnaireSchema.parse(data);

  const doctor = await db.query.doctorsTable.findFirst({
    where: and(
      eq(doctorsTable.id, validated.doctorId),
      eq(doctorsTable.clinicId, session.user.clinic.id),
    ),
  });

  if (!doctor) {
    throw new Error("Médico não encontrado");
  }

  const template = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, validated.templateId),
  });

  if (!template) {
    throw new Error("Template não encontrado");
  }

  const existing = await db.query.questionnairesTable.findFirst({
    where: and(
      eq(questionnairesTable.doctorId, validated.doctorId),
      eq(questionnairesTable.name, validated.name),
    ),
  });

  if (existing) {
    throw new Error("Já existe um questionário com este nome para este médico");
  }

  await db.insert(questionnairesTable).values({
    doctorId: validated.doctorId,
    templateId: validated.templateId,
    name: validated.name,
    isActive: true,
  });

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

export async function getMyQuestionnaires(search?: string, doctorId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  // Buscar todos os médicos da clínica
  const clinicDoctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
  });

  const doctorIds = clinicDoctors.map((d) => d.id);

  if (doctorIds.length === 0) {
    return [];
  }

  // Condições da query
  const conditions = [eq(questionnairesTable.isActive, true)];

  // Se filtrar por médico específico
  if (doctorId && doctorIds.includes(doctorId)) {
    conditions.push(eq(questionnairesTable.doctorId, doctorId));
  }

  const questionnaires = await db.query.questionnairesTable.findMany({
    where: and(...conditions),
    orderBy: [desc(questionnairesTable.createdAt)],
  });

  // Filtrar por médicos da clínica
  const filteredQuestionnaires = questionnaires.filter((q) =>
    doctorIds.includes(q.doctorId),
  );

  const questionnairesWithDetails = await Promise.all(
    filteredQuestionnaires.map(async (q) => {
      const doctor = clinicDoctors.find((d) => d.id === q.doctorId);

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

      const lastResponse = await db.query.questionnaireResponsesTable.findFirst(
        {
          where: eq(questionnaireResponsesTable.questionnaireId, q.id),
          orderBy: [desc(questionnaireResponsesTable.createdAt)],
        },
      );

      return {
        ...q,
        doctor,
        template: template
          ? {
              ...template,
              fields: templateFields.map((tf) => tf.field),
              fieldsCount: templateFields.length,
            }
          : null,
        lastUsed: lastResponse?.completedAt || null,
        usageCount: lastResponse ? 1 : 0,
      };
    }),
  );

  let filtered = questionnairesWithDetails;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = questionnairesWithDetails.filter(
      (q) =>
        q.name.toLowerCase().includes(searchLower) ||
        q.doctor?.name.toLowerCase().includes(searchLower) ||
        q.template?.name?.toLowerCase().includes(searchLower),
    );
  }

  return filtered;
}

export async function getQuestionnaireById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const questionnaire = await db.query.questionnairesTable.findFirst({
    where: eq(questionnairesTable.id, id),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.id, questionnaire.doctorId),
  });

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
    doctor,
    template: template
      ? {
          ...template,
          fields: templateFields.map((tf) => tf.field),
        }
      : null,
  };
}

export async function updateQuestionnaire(id: string, data: { name: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  await db
    .update(questionnairesTable)
    .set({
      name: data.name,
      updatedAt: new Date(),
    })
    .where(eq(questionnairesTable.id, id));

  revalidatePath("/my-questionnaires");
  return { success: true };
}

export async function deleteQuestionnaire(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  await db
    .update(questionnairesTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(questionnairesTable.id, id));

  revalidatePath("/my-questionnaires");
  return { success: true };
}

export async function getDoctorsForSelect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  return doctors;
}

export async function getTemplatesForSelect() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const templates = await db.query.questionnaireTemplatesTable.findMany({
    where: eq(questionnaireTemplatesTable.isActive, true),
    orderBy: (templates, { asc }) => [asc(templates.name)],
  });

  return templates;
}

export async function getMyDoctors() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session.user.clinic.id),
    orderBy: (doctors, { asc }) => [asc(doctors.name)],
  });

  return doctors;
}

export async function getCurrentDoctor() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const doctor = await db.query.doctorsTable.findFirst({
    where: eq(doctorsTable.userId, session.user.id),
  });

  return doctor;
}

export async function reorderQuestionnaireFields(
  questionnaireId: string,
  fieldIds: string[],
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    throw new Error("Não autorizado");
  }

  const questionnaire = await db.query.questionnairesTable.findFirst({
    where: eq(questionnairesTable.id, questionnaireId),
  });

  if (!questionnaire) {
    throw new Error("Questionário não encontrado");
  }

  // Atualizar a ordem dos campos
  for (let i = 0; i < fieldIds.length; i++) {
    await db
      .update(questionnaireTemplateFieldsTable)
      .set({ order: i })
      .where(eq(questionnaireTemplateFieldsTable.id, fieldIds[i]));
  }

  revalidatePath(`/my-questionnaires/${questionnaireId}`);
  return { success: true };
}
