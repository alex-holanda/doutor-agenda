// app/(protected)/attendances/[attendanceId]/start/_components/start-attendance-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Play } from "lucide-react";
import { toast } from "sonner";
import { startAttendance } from "@/actions/start-attendance";

interface StartAttendanceFormProps {
  attendanceId: string;
  patientName: string;
  doctorName: string;
  chiefComplaint: string | null;
}

export function StartAttendanceForm({
  attendanceId,
  patientName,
  doctorName,
  chiefComplaint,
}: StartAttendanceFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [complaint, setComplaint] = useState(chiefComplaint || "");

  const handleStart = async () => {
    if (!complaint.trim()) {
      toast.warning("Por favor, informe a queixa principal");
      return;
    }

    setIsLoading(true);
    try {
      await startAttendance({ attendanceId });
      toast.success("Atendimento iniciado");
      router.push(`/attendances/${attendanceId}/questionnaires`);
    } catch (error) {
      toast.error("Erro ao iniciar atendimento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Confirmar dados do atendimento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Paciente</Label>
            <p className="mt-1 font-medium">{patientName}</p>
          </div>
          <div>
            <Label>Médico</Label>
            <p className="mt-1 font-medium">{doctorName}</p>
          </div>
          <div>
            <Label htmlFor="chiefComplaint">Queixa principal *</Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Descreva o motivo da consulta..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
              className="mt-1"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
        <Button onClick={handleStart} disabled={isLoading}>
          <Play className="mr-2 h-4 w-4" />
          {isLoading ? "Iniciando..." : "Iniciar Atendimento"}
        </Button>
      </div>
    </div>
  );
}
