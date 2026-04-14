// src/app/(protected)/my-questionnaires/[questionnaireId]/_components/questionnaire-edit-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Save, Plus, X, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { updateQuestionnaire } from "@/actions/my-questionnaires";
import { getQuestionFields } from "@/actions/question-fields";
import { getQuestionnaireById } from "@/actions/my-questionnaires";

const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

interface Field {
  id: string;
  name: string;
  description?: string;
  fieldKey: string;
  fieldType: string;
  order: number;
}

interface QuestionnaireEditFormProps {
  questionnaireId: string;
  initialData: {
    name: string;
    templateFields: Field[];
  };
}

export function QuestionnaireEditForm({
  questionnaireId,
  initialData,
}: QuestionnaireEditFormProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [selectedFieldIds, setSelectedFieldIds] = useState<Set<string>>(
    new Set(initialData.templateFields.map((f) => f.id)),
  );

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData.name,
    },
  });

  const { data: allFields = [] } = useQuery({
    queryKey: ["question-fields"],
    queryFn: getQuestionFields,
  });

  const updateMutation = useMutation({
    mutationFn: async (data: { name: string; fieldIds: string[] }) => {
      return updateQuestionnaire(questionnaireId, data);
    },
    onSuccess: () => {
      toast.success("Questionário atualizado com sucesso");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao atualizar");
    },
  });

  const filteredFields = allFields.filter(
    (f: any) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.fieldKey.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggleField = (fieldId: string) => {
    const newSet = new Set(selectedFieldIds);
    if (newSet.has(fieldId)) {
      newSet.delete(fieldId);
    } else {
      newSet.add(fieldId);
    }
    setSelectedFieldIds(newSet);
  };

  const handleSubmit = (data: z.infer<typeof formSchema>) => {
    updateMutation.mutate({
      name: data.name,
      fieldIds: Array.from(selectedFieldIds),
    });
  };

  const isSaving = updateMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Edit Name */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Questionário</CardTitle>
          <CardDescription>Altere o nome do questionário</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do questionário" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Salvando..." : "Salvar Nome"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Fields Management */}
      <Card>
        <CardHeader>
          <CardTitle>Campos do Questionário</CardTitle>
          <CardDescription>
            Selecione os campos que farão parte deste questionário
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              placeholder="Buscar campos..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-[400px] space-y-2 overflow-y-auto">
            {filteredFields.length === 0 ? (
              <p className="text-muted-foreground py-8 text-center">
                Nenhum campo encontrado
              </p>
            ) : (
              filteredFields.map((field: any) => {
                const isSelected = selectedFieldIds.has(field.id);
                const currentOrder = initialData.templateFields.find(
                  (f) => f.id === field.id,
                )?.order;

                return (
                  <div
                    key={field.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleField(field.id)}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{field.name}</p>
                        {currentOrder !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            #{currentOrder + 1}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground text-xs">
                        {field.fieldKey} • {field.fieldType}
                        {field.description && ` • ${field.description}`}
                      </p>
                    </div>
                    {isSelected && (
                      <Badge variant="default" className="text-xs">
                        Selecionado
                      </Badge>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
