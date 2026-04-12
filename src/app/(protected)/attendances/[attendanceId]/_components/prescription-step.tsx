// src/app/(protected)/attendances/[attendanceId]/_components/prescription-step.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface PrescriptionStepProps {
  initialData?: any;
}

export function PrescriptionStep({ initialData }: PrescriptionStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescrição Médica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Medicamentos</Label>
          <Textarea
            name="medications"
            placeholder="Liste os medicamentos, dosagens e horários..."
            rows={4}
            defaultValue={initialData?.medications || ""}
          />
          <p className="text-muted-foreground text-xs">Campo obrigatório</p>
        </div>

        <div className="space-y-2">
          <Label>Exames Solicitados</Label>
          <Textarea
            name="exams"
            placeholder="Liste os exames solicitados..."
            rows={3}
            defaultValue={initialData?.exams || ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Orientações</Label>
          <Textarea
            name="orientations"
            placeholder="Orientações ao paciente..."
            rows={3}
            defaultValue={initialData?.orientations || ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Data de Retorno (opcional)</Label>
          <Input
            type="date"
            name="returnDate"
            defaultValue={
              initialData?.returnDate
                ? initialData.returnDate.split("T")[0]
                : ""
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
