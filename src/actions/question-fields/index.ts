// src/app/(protected)/question-fields/actions/index.ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { questionFieldsCatalogTable } from "@/db/schema";
import { auth } from "@/lib/auth";

const fieldSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  fieldKey: z.string().min(1, "Field key é obrigatório"),
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
  category: z.string().min(1, "Categoria é obrigatória"),
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

  const fields = await db.query.questionFieldsCatalogTable.findMany({
    where: eq(questionFieldsCatalogTable.isActive, true),
    orderBy: (fields, { asc }) => [asc(fields.category), asc(fields.order)],
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

  // Verificar se field key já existe
  const existing = await db.query.questionFieldsCatalogTable.findFirst({
    where: eq(questionFieldsCatalogTable.fieldKey, validated.fieldKey),
  });

  if (existing) {
    throw new Error("Field key já existe");
  }

  await db.insert(questionFieldsCatalogTable).values({
    ...validated,
    isSystem: false,
    isActive: true,
    order: 0,
  });

  revalidatePath("/question-fields");
  return { success: true };
}

// Atualizar campo
export async function updateQuestionField(
  id: string,
  data: Partial<z.infer<typeof fieldSchema>>,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    throw new Error("Não autorizado");
  }

  // Verificar se é campo do sistema (não pode editar)
  const existing = await db.query.questionFieldsCatalogTable.findFirst({
    where: eq(questionFieldsCatalogTable.id, id),
  });

  if (existing?.isSystem) {
    throw new Error("Campos do sistema não podem ser editados");
  }

  await db
    .update(questionFieldsCatalogTable)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(questionFieldsCatalogTable.id, id));

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
  const existing = await db.query.questionFieldsCatalogTable.findFirst({
    where: eq(questionFieldsCatalogTable.id, id),
  });

  if (existing?.isSystem) {
    throw new Error("Campos do sistema não podem ser excluídos");
  }

  await db
    .update(questionFieldsCatalogTable)
    .set({
      isActive: false,
      updatedAt: new Date(),
    })
    .where(eq(questionFieldsCatalogTable.id, id));

  revalidatePath("/question-fields");
  return { success: true };
}
