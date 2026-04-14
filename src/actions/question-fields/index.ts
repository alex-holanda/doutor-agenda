// src/app/(protected)/question-fields/actions/index.ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { questionnaireFieldsTable } from "@/db/schema";
import { auth } from "@/lib/auth";

function generateFieldKey(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[*()\/^~´´\`\`\[\]]/g, "")
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

const fieldSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  fieldType: z.enum([
    "text",
    "textarea",
    "number",
    "select",
    "multi_select",
    "radio",
    "checkbox",
    "date",
    "time",
    "boolean",
    "scale",
  ]),
  description: z.string().optional(),
  unit: z.string().optional(),
  minValue: z.number().optional().nullable(),
  maxValue: z.number().optional().nullable(),
  options: z.array(z.string()).optional().nullable(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  isRequired: z.boolean().default(false),
});

// Listar campos
export async function getQuestionFields() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const fields = await db.query.questionnaireFieldsTable.findMany({
    where: eq(questionnaireFieldsTable.isActive, true),
    orderBy: (fields, { asc }) => [asc(fields.order)],
  });

  return fields;
}

// Criar campo
export async function createQuestionField(data: z.infer<typeof fieldSchema>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  const validated = fieldSchema.parse(data);

  // Gerar fieldKey automaticamente a partir do nome
  const fieldKey = generateFieldKey(validated.name);

  // Verificar se field key já existe
  let existing = await db.query.questionnaireFieldsTable.findFirst({
    where: eq(questionnaireFieldsTable.fieldKey, fieldKey),
  });

  // Se já existir, adicionar sufixo numérico
  let finalFieldKey = fieldKey;
  let counter = 1;
  while (existing) {
    finalFieldKey = `${fieldKey}_${counter}`;
    existing = await db.query.questionnaireFieldsTable.findFirst({
      where: eq(questionnaireFieldsTable.fieldKey, finalFieldKey),
    });
    counter++;
  }

  await db.insert(questionnaireFieldsTable).values({
    name: validated.name,
    fieldKey: finalFieldKey,
    fieldType: validated.fieldType,
    description: validated.description,
    unit: validated.unit,
    minValue: validated.minValue,
    maxValue: validated.maxValue,
    options: validated.options,
    placeholder: validated.placeholder,
    helpText: validated.helpText,
    isRequired: validated.isRequired,
    isActive: true,
    order: 0,
  });

  revalidatePath("/question-fields");
  return { success: true };
}

// Atualizar campo
export async function updateQuestionField(
  id: string,
  data: Partial<{
    name: string;
    fieldType:
      | "text"
      | "textarea"
      | "number"
      | "select"
      | "multi_select"
      | "radio"
      | "checkbox"
      | "date"
      | "time"
      | "boolean"
      | "scale";
    description: string;
    unit: string;
    minValue: number;
    maxValue: number;
    options: string[];
    placeholder: string;
    helpText: string;
    isRequired: boolean;
  }>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se é campo do sistema (não pode editar)
  const existing = await db.query.questionnaireFieldsTable.findFirst({
    where: eq(questionnaireFieldsTable.id, id),
  });

  // Regenerar fieldKey se o nome mudou
  let newFieldKey = existing?.fieldKey;
  if (data.name && data.name !== existing?.name) {
    newFieldKey = generateFieldKey(data.name);

    // Verificar se já existe
    let duplicate = await db.query.questionnaireFieldsTable.findFirst({
      where: eq(questionnaireFieldsTable.fieldKey, newFieldKey),
    });

    let counter = 1;
    while (duplicate && duplicate.id !== id) {
      newFieldKey = `${generateFieldKey(data.name)}_${counter}`;
      duplicate = await db.query.questionnaireFieldsTable.findFirst({
        where: eq(questionnaireFieldsTable.fieldKey, newFieldKey),
      });
      counter++;
    }
  }

  await db
    .update(questionnaireFieldsTable)
    .set({
      name: data.name,
      fieldKey: newFieldKey,
      fieldType: data.fieldType,
      description: data.description,
      unit: data.unit,
      minValue: data.minValue || null,
      maxValue: data.maxValue || null,
      options: data.options,
      placeholder: data.placeholder,
      helpText: data.helpText,
      isRequired: data.isRequired || false,
      updatedAt: new Date(),
    })
    .where(eq(questionnaireFieldsTable.id, id));

  revalidatePath("/question-fields");
  return { success: true };
}

// Excluir campo (soft delete)
export async function deleteQuestionField(id: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se é campo do sistema (não pode excluir)
  const existing = await db.query.questionnaireFieldsTable.findFirst({
    where: eq(questionnaireFieldsTable.id, id),
  });

  if (!existing) {
    throw new Error("Campo não encontrado");
  }

  await db
    .update(questionnaireFieldsTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(questionnaireFieldsTable.id, id));

  revalidatePath("/question-fields");
  return { success: true };
}
