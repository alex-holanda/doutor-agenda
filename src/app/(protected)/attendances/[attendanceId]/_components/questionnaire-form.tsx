// app/attendances/[attendanceId]/_components/questionnaire-form.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { saveQuestionnaireResponse } from "@/actions/save-questionnaire-response";
import { getQuestionnaireWithFields } from "@/actions/get-questionnaire-with-fields";
import { DynamicField } from "./dynamic-field";

interface QuestionnaireField {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired?: boolean | null;
  options?: string[] | null;
  minValue?: number | null;
  maxValue?: number | null;
  order?: number | null;
}

interface Questionnaire {
  id: string;
  name: string;
  category: string | null;
  fields: QuestionnaireField[];
}

interface QuestionnaireFormProps {
  questionnaireId: string;
  attendanceId: string;
  initialData?: Record<string, any>;
  isCompleted: boolean;
  onSuccess: () => void;
}

export function QuestionnaireForm({
  questionnaireId,
  attendanceId,
  initialData,
  isCompleted,
  onSuccess,
}: QuestionnaireFormProps) {
  const [isSaving, setIsSaving] = useState(false);

  const { data: questionnaireData, isLoading } = useQuery({
    queryKey: ["questionnaire", questionnaireId],
    queryFn: () => getQuestionnaireWithFields({ questionnaireId }),
  });

  // Log para depuração
  console.log("questionnaireData:", questionnaireData);
  console.log("questionnaireData?.data:", questionnaireData?.data);

  // Tenta acessar os dados de diferentes formas possíveis
  const questionnaire = (questionnaireData?.data || questionnaireData) as
    | Questionnaire
    | undefined;
  const fields = questionnaire?.fields || [];

  console.log("questionnaire:", questionnaire);
  console.log("fields:", fields);

  const formSchema = z.object(
    fields.reduce<Record<string, z.ZodTypeAny>>((acc, field) => {
      if (field.isRequired) {
        if (field.fieldType === "number") {
          acc[field.fieldKey] = z
            .number()
            .min(1, `${field.label} é obrigatório`);
        } else if (field.fieldType === "boolean") {
          acc[field.fieldKey] = z.boolean().refine((val) => val === true, {
            message: `${field.label} é obrigatório`,
          });
        } else if (field.fieldType === "scale") {
          acc[field.fieldKey] = z
            .number()
            .min(field.minValue || 0, `${field.label} é obrigatório`);
        } else if (field.fieldType === "multi_select") {
          acc[field.fieldKey] = z
            .array(z.string())
            .min(1, `${field.label} é obrigatório`);
        } else {
          acc[field.fieldKey] = z
            .string()
            .min(1, `${field.label} é obrigatório`);
        }
      } else {
        if (field.fieldType === "number") {
          acc[field.fieldKey] = z.number().optional();
        } else if (field.fieldType === "boolean") {
          acc[field.fieldKey] = z.boolean().optional();
        } else if (field.fieldType === "multi_select") {
          acc[field.fieldKey] = z.array(z.string()).optional();
        } else {
          acc[field.fieldKey] = z.string().optional();
        }
      }
      return acc;
    }, {}),
  );

  const form = useForm<Record<string, any>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const onSubmit = async (data: Record<string, any>) => {
    setIsSaving(true);
    try {
      await saveQuestionnaireResponse({
        attendanceId,
        questionnaireId,
        responseData: data,
      });
      toast.success("Questionário salvo com sucesso");
      onSuccess();
    } catch (error) {
      toast.error("Erro ao salvar questionário");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!questionnaire || !fields.length) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        <p>Questionário não encontrado ou sem campos</p>
        <pre className="mt-2 text-xs">
          {JSON.stringify(questionnaireData, null, 2)}
        </pre>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {fields.map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            control={form.control}
            disabled={isCompleted}
          />
        ))}

        {!isCompleted && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar questionário"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
