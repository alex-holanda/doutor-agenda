// src/app/(protected)/attendances/[attendanceId]/_components/physical-exam-step.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PhysicalExamStepProps {
  initialData?: any;
}

const selectOptions = {
  generalState: ["Bom", "Regular", "Ruim"],
  consciousnessLevel: ["Consciente", "Sonolento", "Confuso", "Inconsciente"],
  hydration: [
    "Hidratado",
    "Desidratado leve",
    "Desidratado moderado",
    "Desidratado grave",
  ],
  skinColor: ["Normal", "Pálida", "Ictérica", "Cianótica", "Avermelhada"],
};

export function PhysicalExamStep({ initialData }: PhysicalExamStepProps) {
  const renderSelect = (name: string, label: string, options: string[]) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <select
        name={name}
        className="w-full rounded-md border p-2"
        defaultValue={initialData?.[name] || ""}
      >
        <option value="">Selecione...</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Exame Físico</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {renderSelect(
            "generalState",
            "Estado Geral",
            selectOptions.generalState,
          )}
          {renderSelect(
            "consciousnessLevel",
            "Nível de Consciência",
            selectOptions.consciousnessLevel,
          )}
          {renderSelect("hydration", "Hidratação", selectOptions.hydration)}
          {renderSelect(
            "skinColor",
            "Coloração da Pele",
            selectOptions.skinColor,
          )}
        </div>

        <div className="space-y-2">
          <Label>Ausculta Pulmonar</Label>
          <Textarea
            name="lungAuscultation"
            placeholder="Descreva os achados..."
            rows={2}
            defaultValue={initialData?.lungAuscultation}
          />
        </div>

        <div className="space-y-2">
          <Label>Ausculta Cardíaca</Label>
          <Textarea
            name="heartAuscultation"
            placeholder="Descreva os achados..."
            rows={2}
            defaultValue={initialData?.heartAuscultation}
          />
        </div>

        <div className="space-y-2">
          <Label>Abdome</Label>
          <Textarea
            name="abdomen"
            placeholder="Descreva o exame do abdome..."
            rows={2}
            defaultValue={initialData?.abdomen}
          />
        </div>

        <div className="space-y-2">
          <Label>Extremidades</Label>
          <Textarea
            name="extremities"
            placeholder="Descreva o exame das extremidades..."
            rows={2}
            defaultValue={initialData?.extremities}
          />
        </div>
      </CardContent>
    </Card>
  );
}
