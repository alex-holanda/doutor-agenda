// src/app/(protected)/my-questionnaires/_components/questionnaire-detail-dialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface QuestionnaireDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaire: any;
}

const categoryLabels: Record<string, string> = {
  vital_signs: "Sinais Vitais",
  anamnesis: "Anamnese",
  physical_exam: "Exame Físico",
  prescription: "Prescrição",
  custom: "Personalizado",
};

export function QuestionnaireDetailDialog({
  open,
  onOpenChange,
  questionnaire,
}: QuestionnaireDetailDialogProps) {
  if (!questionnaire) return null;

  const fields = questionnaire.template?.fields || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{questionnaire.name}</DialogTitle>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline">
              {categoryLabels[questionnaire.template?.category] ||
                "Personalizado"}
            </Badge>
            <Badge variant="secondary">
              Baseado em: {questionnaire.template?.name}
            </Badge>
          </div>
        </DialogHeader>

        <Separator />

        <div>
          <h3 className="mb-4 font-semibold">Campos do Questionário</h3>
          <div className="space-y-3">
            {fields.map((field: any, index: number) => (
              <Card key={field.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">
                        {field.name}
                        {field.isRequired && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        {field.fieldKey} • {field.fieldType}
                        {field.unit && ` • ${field.unit}`}
                      </p>
                      {field.helpText && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {field.helpText}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      {index + 1}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
