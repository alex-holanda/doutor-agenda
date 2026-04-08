import { z } from "zod";

const sexEnum = ["male", "female"] as const;

export const upsertPatientSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, {
    message: "Nome é obrigatório.",
  }),
  email: z.string().email({
    message: "Email inválido.",
  }),
  phoneNumber: z.string().trim().min(1, {
    message: "Número de telefone é obrigatório.",
  }),
  sex: z.enum(sexEnum),
});

export type UpsertPatientSchema = z.infer<typeof upsertPatientSchema>;
