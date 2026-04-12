// src/app/(protected)/questionnaire-templates/_components/template-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { getQuestionFields } from "@/actions/question-fields";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
  category: z.string().min(1, "Categoria é obrigatória"),
  categoryType: z.enum(["system", "clinic", "personal"]).default("personal"),
  fieldIds: z.array(z.string()).min(1, "Selecione pelo menos um campo"),
});

interface TemplateFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const categories = [
  { value: "vital_signs", label: "Sinais Vitais" },
  { value: "anamnesis", label: "Anamnese" },
  { value: "physical_exam", label: "Exame Físico" },
  { value: "prescription", label: "Prescrição" },
  { value: "custom", label: "Personalizado" },
];

export function TemplateForm({
  initialData,
  onSubmit,
  isLoading,
}: TemplateFormProps) {
  const [selectedCategory, setSelectedCategory] = useState(
    initialData?.category || "",
  );

  const { data: fields = [] } = useQuery({
    queryKey: ["question-fields"],
    queryFn: () => getQuestionFields(),
  });

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      category: initialData?.category || "",
      categoryType: initialData?.categoryType || "personal",
      fieldIds: initialData?.fields?.map((f: any) => f.id) || [],
    },
  });

  const selectedFieldIds = form.watch("fieldIds");
  const category = form.watch("category");

  // Filtrar campos pela categoria selecionada
  const filteredFields = fields.filter(
    (field: any) => category === "custom" || field.category === category,
  );

  const handleFieldToggle = (fieldId: string) => {
    const current = form.getValues("fieldIds");
    if (current.includes(fieldId)) {
      form.setValue(
        "fieldIds",
        current.filter((id: string) => id !== fieldId),
      );
    } else {
      form.setValue("fieldIds", [...current, fieldId]);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do template *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Anamnese Pediátrica" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o propósito deste questionário"
                  {...field}
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria *</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  form.setValue("fieldIds", []);
                }}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Selecionar campos *</FormLabel>
          <div className="max-h-[400px] overflow-y-auto rounded-lg border p-4">
            {filteredFields.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                {category
                  ? "Nenhum campo disponível para esta categoria"
                  : "Selecione uma categoria primeiro"}
              </p>
            ) : (
              <div className="space-y-2">
                {filteredFields.map((field: any) => (
                  <div
                    key={field.id}
                    className="hover:bg-muted flex items-center justify-between rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedFieldIds.includes(field.id)}
                        onCheckedChange={() => handleFieldToggle(field.id)}
                      />
                      <div>
                        <p className="font-medium">{field.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {field.fieldKey} • {field.fieldType}
                          {field.unit && ` • ${field.unit}`}
                        </p>
                      </div>
                    </div>
                    {field.isRequired && (
                      <Badge variant="outline" className="text-xs">
                        Obrigatório
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <FormDescription>
            Selecione os campos que farão parte deste questionário
          </FormDescription>
          {form.formState.errors.fieldIds && (
            <p className="text-sm text-red-500">
              {form.formState.errors.fieldIds.message}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? "Salvando..."
              : initialData
                ? "Atualizar"
                : "Criar Template"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
