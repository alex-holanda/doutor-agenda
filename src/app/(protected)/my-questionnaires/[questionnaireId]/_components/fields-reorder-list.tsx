// src/app/(protected)/my-questionnaires/[questionnaireId]/_components/fields-reorder-list.tsx
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reorderQuestionnaireFields } from "@/actions/my-questionnaires";
import { useRouter } from "next/navigation";

interface Field {
  id: string;
  name: string;
  description?: string;
  fieldKey: string;
  fieldType: string;
  order: number;
}

interface FieldsReorderListProps {
  questionnaireId: string;
  fields: Field[];
}

export function FieldsReorderList({
  questionnaireId,
  fields: initialFields,
}: FieldsReorderListProps) {
  const router = useRouter();
  const [fields, setFields] = useState<Field[]>(initialFields);

  const { mutate: saveOrder, isPending: isSaving } = useMutation({
    mutationFn: async (fieldIds: string[]) => {
      return reorderQuestionnaireFields(questionnaireId, fieldIds);
    },
    onSuccess: () => {
      toast.success("Ordem salva com sucesso");
      router.refresh();
    },
    onError: (error: any) => {
      toast.error(error.message || "Erro ao salvar ordem");
    },
  });

  const moveField = (currentIndex: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= newFields.length) return;

    const temp = newFields[currentIndex];
    newFields[currentIndex] = newFields[newIndex];
    newFields[newIndex] = temp;
    newFields.forEach((f, i) => (f.order = i));
    setFields(newFields);
  };

  const handleSave = () => {
    const fieldIds = fields.map((f) => f.id);
    saveOrder(fieldIds);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Campos do Questionário</CardTitle>
        <Button onClick={handleSave} disabled={isSaving} size="sm">
          <Save className="mr-2 h-4 w-4" />
          {isSaving ? "Salvando..." : "Salvar Ordem"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="hover:bg-muted/50 flex items-center gap-2 rounded-lg border p-3 transition-colors"
          >
            <div className="bg-muted flex h-6 w-6 items-center justify-center rounded text-xs font-medium">
              {index + 1}
            </div>
            <div className="flex-1">
              <p className="font-medium">{field.name}</p>
              {field.description && (
                <p className="text-muted-foreground text-xs">
                  {field.description}
                </p>
              )}
            </div>
            <span className="text-muted-foreground text-xs">
              {field.fieldType}
            </span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveField(index, "up")}
                disabled={index === 0}
              >
                ↑
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => moveField(index, "down")}
                disabled={index === fields.length - 1}
              >
                ↓
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
