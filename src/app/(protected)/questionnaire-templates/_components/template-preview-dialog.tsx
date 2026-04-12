// src/app/(protected)/questionnaire-templates/_components/template-preview-dialog.tsx
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

interface TemplatePreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export function TemplatePreviewDialog({
  open,
  onOpenChange,
  template,
}: TemplatePreviewDialogProps) {
  if (!template) return null;

  const categoryLabels: Record<string, string> = {
    vital_signs: "Sinais Vitais",
    anamnesis: "Anamnese",
    physical_exam: "Exame Físico",
    prescription: "Prescrição",
    custom: "Personalizado",
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{template.name}</DialogTitle>
          <div className="mt-2 flex gap-2">
            <Badge variant={template.isSystem ? "default" : "secondary"}>
              {template.isSystem ? "Sistema" : "Personalizado"}
            </Badge>
            <Badge variant="outline">
              {categoryLabels[template.category] || template.category}
            </Badge>
            <Badge variant="outline">{template.fieldsCount} campos</Badge>
          </div>
        </DialogHeader>

        {template.description && (
          <div>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
        )}

        <Separator />

        <div>
          <h3 className="mb-4 font-semibold">Campos do Questionário</h3>
          <div className="space-y-3">
            {template.fields?.map((field: any, index: number) => (
              <Card key={field.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
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
                    <Badge variant="outline">{index + 1}</Badge>
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
