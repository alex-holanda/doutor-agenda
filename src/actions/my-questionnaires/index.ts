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
  doctorId: z.string().uuid("Selecione um médico"),
  templateId: z.string().uuid("Selecione um template"),
  name: z.string().min(1, "Nome é obrigatório"),
});

// Criar questionário
export async function createDoctorQuestionnaire(
  data: z.infer<typeof doctorQuestionnaireSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const validated = doctorQuestionnaireSchema.parse(data);

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

  const existing = await db.query.doctorQuestionnairesTable.findFirst({
    where: and(
      eq(doctorQuestionnairesTable.doctorId, validated.doctorId),
      eq(doctorQuestionnairesTable.name, validated.name),
    ),
  });

  if (existing) {
    throw new Error("Já existe um questionário com este nome para este médico");
  }

  await db.insert(doctorQuestionnairesTable).values({
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

// Listar todos os questionários (com filtros)
export async function getMyQuestionnaires(search?: string, doctorId?: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const conditions = [];

  if (doctorId) {
    conditions.push(eq(doctorQuestionnairesTable.doctorId, doctorId));
  }

  const questionnaires = await db.query.doctorQuestionnairesTable.findMany({
    where: and(eq(doctorQuestionnairesTable.isActive, true), ...conditions),
    orderBy: [desc(doctorQuestionnairesTable.createdAt)],
  });

  const questionnairesWithDetails = await Promise.all(
    questionnaires.map(async (q) => {
      const doctor = await db.query.doctorsTable.findFirst({
        where: eq(doctorsTable.id, q.doctorId),
      });

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
          where: eq(questionnaireResponsesTable.doctorQuestionnaireId, q.id),
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

// Obter questionário por ID
export async function getQuestionnaireById(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const questionnaire = await db.query.doctorQuestionnairesTable.findFirst({
    where: eq(doctorQuestionnairesTable.id, id),
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

// Atualizar questionário
export async function updateQuestionnaire(id: string, data: { name: string }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
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

// Excluir questionário
export async function deleteQuestionnaire(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
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

// Buscar médicos para o select
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

// Buscar templates para o select
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

// =============================================
// NOVAS FUNÇÕES PARA MÉDICOS
// =============================================

// Buscar todos os médicos da clínica do usuário
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

// Buscar o médico atual baseado no usuário logado
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
