// src/app/(protected)/questionnaire-templates/actions/index.ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and, desc, asc } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import {
  questionnaireTemplatesTable,
  questionnaireTemplateFieldsTable,
  questionnaireFieldsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

const templateSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  categoryType: z.enum(["system", "clinic", "personal"]).default("personal"),
  fieldIds: z.array(z.string()).min(1, "Selecione pelo menos um campo"),
});

// Listar templates
export async function getQuestionnaireTemplates() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const templates = await db.query.questionnaireTemplatesTable.findMany({
    where: eq(questionnaireTemplatesTable.isActive, true),
    orderBy: [
      desc(questionnaireTemplatesTable.isSystem),
      asc(questionnaireTemplatesTable.name),
    ],
  });

  // Buscar campos para cada template
  const templatesWithFields = await Promise.all(
    templates.map(async (template) => {
      const templateFields =
        await db.query.questionnaireTemplateFieldsTable.findMany({
          where: eq(questionnaireTemplateFieldsTable.templateId, template.id),
          with: {
            field: true,
          },
          orderBy: (fields, { asc }) => [asc(fields.order)],
        });

      return {
        ...template,
        fields: templateFields.map((tf) => tf.field),
        fieldsCount: templateFields.length,
      };
    }),
  );

  return templatesWithFields;
}

// Criar template
export async function createQuestionnaireTemplate(
  data: z.infer<typeof templateSchema>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const validated = templateSchema.parse(data);

  // Inserir template
  const [template] = await db
    .insert(questionnaireTemplatesTable)
    .values({
      name: validated.name,
      description: validated.description,
      category: validated.category,
      categoryType: validated.categoryType,
      clinicId: session.user.clinic.id,
      isSystem: false,
      isActive: true,
      version: 1,
    })
    .returning();

  // Inserir campos do template
  for (let i = 0; i < validated.fieldIds.length; i++) {
    await db.insert(questionnaireTemplateFieldsTable).values({
      templateId: template.id,
      fieldId: validated.fieldIds[i],
      order: i,
      isRequired: false,
    });
  }

  revalidatePath("/questionnaire-templates");
  return { success: true };
}

// Atualizar template
export async function updateQuestionnaireTemplate(
  id: string,
  data: Partial<z.infer<typeof templateSchema>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const template = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, id),
  });

  if (template?.isSystem) {
    throw new Error("Templates do sistema não podem ser editados");
  }

  await db
    .update(questionnaireTemplatesTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(questionnaireTemplatesTable.id, id));

  // Se fieldIds foi fornecido, atualizar campos
  if (data.fieldIds) {
    // Remover campos antigos
    await db
      .delete(questionnaireTemplateFieldsTable)
      .where(eq(questionnaireTemplateFieldsTable.templateId, id));

    // Inserir novos campos
    for (let i = 0; i < data.fieldIds.length; i++) {
      await db.insert(questionnaireTemplateFieldsTable).values({
        templateId: id,
        fieldId: data.fieldIds[i],
        order: i,
        isRequired: false,
      });
    }
  }

  revalidatePath("/questionnaire-templates");
  return { success: true };
}

// Excluir template (soft delete)
export async function deleteQuestionnaireTemplate(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const template = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, id),
  });

  if (template?.isSystem) {
    throw new Error("Templates do sistema não podem ser excluídos");
  }

  await db
    .update(questionnaireTemplatesTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(questionnaireTemplatesTable.id, id));

  revalidatePath("/questionnaire-templates");
  return { success: true };
}

// Duplicar template
export async function duplicateQuestionnaireTemplate(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const original = await db.query.questionnaireTemplatesTable.findFirst({
    where: eq(questionnaireTemplatesTable.id, id),
  });

  if (!original) {
    throw new Error("Template não encontrado");
  }

  const originalFields =
    await db.query.questionnaireTemplateFieldsTable.findMany({
      where: eq(questionnaireTemplateFieldsTable.templateId, id),
    });

  // Criar cópia
  const [newTemplate] = await db
    .insert(questionnaireTemplatesTable)
    .values({
      name: `${original.name} (Cópia)`,
      description: original.description,
      category: original.category,
      categoryType: "personal",
      clinicId: session.user.clinic.id,
      isSystem: false,
      isActive: true,
      version: 1,
    })
    .returning();

  // Copiar campos
  for (let i = 0; i < originalFields.length; i++) {
    await db.insert(questionnaireTemplateFieldsTable).values({
      templateId: newTemplate.id,
      fieldId: originalFields[i].fieldId,
      order: originalFields[i].order,
      isRequired: originalFields[i].isRequired,
    });
  }

  revalidatePath("/questionnaire-templates");
  return { success: true };
}
