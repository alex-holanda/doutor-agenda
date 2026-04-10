// app/attendances/[attendanceId]/_components/questionnaire-form.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAction } from "next-safe-action/hooks";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { saveQuestionnaireResponse } from "@/actions/save-questionnaire-response";
import { getQuestionnaireWithFields } from "@/actions/get-questionnaire-with-fields";
import { DynamicField } from "./dynamic-field";

interface QuestionnaireFormProps {
  questionnaireId: string;
  attendanceId: string;
  initialData?: any;
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
  // Buscar o questionário com seus campos
  const { data: questionnaireData, isLoading } = useQuery({
    queryKey: ["questionnaire", questionnaireId],
    queryFn: () => getQuestionnaireWithFields({ questionnaireId }),
  });

  const questionnaire = questionnaireData?.data;

  // Construir o schema de validação dinamicamente
  const formSchema = z.object(
    (questionnaire?.fields || []).reduce((acc, field) => {
      let validator: any = z.any();

      if (field.isRequired) {
        if (field.fieldType === "boolean") {
          validator = z.boolean();
        } else if (field.fieldType === "number") {
          validator = z.number().min(1, `${field.label} é obrigatório`);
        } else {
          validator = z.string().min(1, `${field.label} é obrigatório`);
        }
      }

      return { ...acc, [field.fieldKey]: validator };
    }, {}),
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {},
  });

  // Resetar o formulário quando os dados iniciais mudarem
  useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  const { execute, isPending } = useAction(saveQuestionnaireResponse, {
    onSuccess: () => {
      toast.success("Questionário salvo com sucesso");
      onSuccess();
    },
    onError: (error) => {
      console.error(error);
      toast.error("Erro ao salvar questionário");
    },
  });

  const onSubmit = (data: any) => {
    execute({
      attendanceId,
      questionnaireId,
      responseData: data,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="text-muted-foreground h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (!questionnaire) {
    return (
      <div className="text-muted-foreground py-8 text-center">
        Questionário não encontrado
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {questionnaire.fields.map((field) => (
          <DynamicField
            key={field.id}
            field={field}
            control={form.control}
            disabled={isCompleted}
          />
        ))}

        {!isCompleted && (
          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : "Salvar questionário"}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
