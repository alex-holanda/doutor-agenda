// src/app/(protected)/attendances/[attendanceId]/_components/vital-signs-step.tsx
"use client";

import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface VitalSignsStepProps {
  initialData?: any;
}

export function VitalSignsStep({ initialData }: VitalSignsStepProps) {
  // Calcular IMC automaticamente
  useEffect(() => {
    const weightInput = document.querySelector(
      'input[name="weight"]',
    ) as HTMLInputElement;
    const heightInput = document.querySelector(
      'input[name="height"]',
    ) as HTMLInputElement;
    const bmiInput = document.querySelector(
      'input[name="bmi"]',
    ) as HTMLInputElement;

    const calculateBMI = () => {
      const weight = parseFloat(weightInput?.value);
      const height = parseFloat(heightInput?.value);

      if (weight && height && height > 0 && bmiInput) {
        const heightInM = height / 100;
        const bmi = weight / (heightInM * heightInM);
        bmiInput.value = bmi.toFixed(1);
      }
    };

    weightInput?.addEventListener("input", calculateBMI);
    heightInput?.addEventListener("input", calculateBMI);

    return () => {
      weightInput?.removeEventListener("input", calculateBMI);
      heightInput?.removeEventListener("input", calculateBMI);
    };
  }, []);

  // Atualizar o valor da escala de dor visualmente
  const updatePainScaleValue = (value: string) => {
    const span = document.getElementById("painScaleValue");
    if (span) span.textContent = value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sinais Vitais</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pressão Arterial */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Pressão Arterial</Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bloodPressureSystolic">
                Sistólica <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bloodPressureSystolic"
                name="bloodPressureSystolic"
                type="number"
                placeholder="mmHg"
                defaultValue={initialData?.bloodPressureSystolic}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bloodPressureDiastolic">
                Diastólica <span className="text-red-500">*</span>
              </Label>
              <Input
                id="bloodPressureDiastolic"
                name="bloodPressureDiastolic"
                type="number"
                placeholder="mmHg"
                defaultValue={initialData?.bloodPressureDiastolic}
                required
              />
            </div>
          </div>
        </div>

        {/* Frequência Cardíaca e Respiratória */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Frequências</Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="heartRate">
                Cardíaca <span className="text-red-500">*</span>
              </Label>
              <Input
                id="heartRate"
                name="heartRate"
                type="number"
                placeholder="bpm"
                defaultValue={initialData?.heartRate}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratória</Label>
              <Input
                id="respiratoryRate"
                name="respiratoryRate"
                type="number"
                placeholder="rpm"
                defaultValue={initialData?.respiratoryRate}
              />
            </div>
          </div>
        </div>

        {/* Temperatura e Saturação */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Outros Sinais</Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperatura</Label>
              <Input
                id="temperature"
                name="temperature"
                type="number"
                step="0.1"
                placeholder="°C"
                defaultValue={initialData?.temperature}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">
                Saturação <span className="text-red-500">*</span>
              </Label>
              <Input
                id="oxygenSaturation"
                name="oxygenSaturation"
                type="number"
                placeholder="%"
                defaultValue={initialData?.oxygenSaturation}
                required
              />
            </div>
          </div>
        </div>

        {/* Glicemia */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Glicemia</Label>
          <div className="grid grid-cols-1 md:max-w-xs">
            <div className="space-y-2">
              <Label htmlFor="bloodGlucose">Capilar</Label>
              <Input
                id="bloodGlucose"
                name="bloodGlucose"
                type="number"
                placeholder="mg/dL"
                defaultValue={initialData?.bloodGlucose}
              />
            </div>
          </div>
        </div>

        {/* Antropometria */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Antropometria</Label>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="weight">Peso</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                placeholder="kg"
                defaultValue={initialData?.weight}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Altura</Label>
              <Input
                id="height"
                name="height"
                type="number"
                step="0.01"
                placeholder="cm"
                defaultValue={initialData?.height}
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:max-w-xs">
            <div className="space-y-2">
              <Label htmlFor="bmi">IMC</Label>
              <Input
                id="bmi"
                name="bmi"
                type="number"
                step="0.1"
                placeholder="kg/m²"
                defaultValue={initialData?.bmi}
                readOnly
                className="bg-muted"
              />
            </div>
          </div>
        </div>

        {/* Escala de Dor */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Avaliação da Dor</Label>
          <div className="space-y-2">
            <Label htmlFor="painScale">Escala de Dor (0-10)</Label>
            <div className="flex items-center gap-4">
              <input
                id="painScale"
                name="painScale"
                type="range"
                min="0"
                max="10"
                step="1"
                className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-gray-200"
                defaultValue={initialData?.painScale || 0}
                onChange={(e) => updatePainScaleValue(e.target.value)}
              />
              <span
                id="painScaleValue"
                className="flex w-12 items-center justify-center text-lg font-bold"
              >
                {initialData?.painScale || 0}
              </span>
            </div>
            <div className="text-muted-foreground flex justify-between px-1 text-xs">
              <span>0 - Sem dor</span>
              <span>5 - Dor moderada</span>
              <span>10 - Pior dor</span>
            </div>
          </div>
        </div>

        {/* Observações */}
        <div className="space-y-3">
          <Label className="text-base font-semibold">Observações</Label>
          <div className="space-y-2">
            <Textarea
              id="notes"
              name="notes"
              placeholder="Observações adicionais sobre os sinais vitais..."
              rows={3}
              defaultValue={initialData?.notes}
            />
          </div>
        </div>

        {/* Campos ocultos para metadados */}
        <input type="hidden" name="measuredBy" value="doctor" />
      </CardContent>
    </Card>
  );
}
