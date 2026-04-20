// src/app/(protected)/attendances/[attendanceId]/report/_components/print-template.tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface PrintTemplateProps {
  attendance: any;
  vitalSigns: any;
  physicalExam: any;
  prescription: any;
  questionnaires: any[];
}

export function PrintTemplate({
  attendance,
  vitalSigns,
  physicalExam,
  prescription,
  questionnaires,
}: PrintTemplateProps) {
  const attendanceDate = attendance?.createdAt
    ? format(new Date(attendance.createdAt), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      })
    : "";

  const attendanceDateOnly = attendance?.createdAt
    ? format(new Date(attendance.createdAt), "dd/MM/yyyy", { locale: ptBR })
    : "";

  const formatReturnDate = (date: any) => {
    if (!date) return null;
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch {
      return null;
    }
  };

  return (
    <div className="hidden print:block p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="text-lg font-bold">RELATÓRIO DE ATENDIMENTO</h1>
        <p className="text-sm text-muted-foreground">
          {attendance.doctor?.name} | {attendanceDate}
        </p>
      </div>

      <Separator className="my-3" />

      {/* Sinais Vitais */}
      {vitalSigns && (
        <div className="mb-3">
          <h2 className="font-semibold text-xs mb-1">SINAIS VITAIS</h2>
          <div className="text-xs space-y-0.5">
            <p>
              PA: {vitalSigns.bloodPressureSystolic}/{vitalSigns.bloodPressureDiastolic}
              mmHg | FC: {vitalSigns.heartRate} bpm | FR: {vitalSigns.respiratoryRate}{" "}
              rpm
            </p>
            <p>
              Temp: {vitalSigns.temperature} °C | Sat: {vitalSigns.oxygenSaturation}
              % | Glicemia: {vitalSigns.bloodGlucose} mg/dL
            </p>
            <p>Peso: {vitalSigns.weight} kg | Altura: {vitalSigns.height} cm</p>
          </div>
        </div>
      )}

      <Separator className="my-3" />

      {/* Exame Físico */}
      {physicalExam && (
        <div className="mb-3">
          <h2 className="font-semibold text-xs mb-1">EXAME FÍSICO</h2>
          <div className="text-xs space-y-0.5">
            <p>
              {physicalExam.generalState} | {physicalExam.consciousnessLevel} |{" "}
              {physicalExam.hydration} | {physicalExam.skinColor}
            </p>
            {physicalExam.lungAuscultation && (
              <p>Ausculta Pulmonar: {physicalExam.lungAuscultation}</p>
            )}
            {physicalExam.heartAuscultation && (
              <p>Ausculta Cardíaca: {physicalExam.heartAuscultation}</p>
            )}
            {physicalExam.abdomen && <p>Abdome: {physicalExam.abdomen}</p>}
            {physicalExam.extremities && (
              <p>Extremidades: {physicalExam.extremities}</p>
            )}
          </div>
        </div>
      )}

      <Separator className="my-3" />

      {/* Questionários */}
      {questionnaires.length > 0 && (
        <div className="mb-3">
          {questionnaires.map((q) => (
            <div key={q.id} className="mb-2">
              <h2 className="font-semibold text-xs mb-1">{q.name}</h2>
              <div className="text-xs space-y-0.5">
                {q.fields?.map((field: any) => {
                  const value = q.responseData?.[field.fieldKey];
                  if (!value) return null;
                  return <p key={field.id}>{field.label || field.name}: {value}</p>;
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {(questionnaires?.length ?? 0) > 0 && <Separator className="my-3" />}

      {/* Prescrição */}
      <div className="mb-3">
        <h2 className="font-semibold text-xs mb-1">PRESCRIÇÃO</h2>
        <div className="text-xs space-y-1">
          {prescription?.medications && (
            <div className="whitespace-pre-wrap">{prescription.medications}</div>
          )}
          {prescription?.exams && <div className="whitespace-pre-wrap">{prescription.exams}</div>}
          {prescription?.orientations && (
            <div className="whitespace-pre-wrap">{prescription.orientations}</div>
          )}
        </div>
      </div>

      <Separator className="my-3" />

      {/* Footer */}
      <div className="text-center text-xs">
        <p className="font-medium">{attendance.doctor?.name}</p>
        <p>{attendanceDateOnly}</p>
        {prescription?.returnDate && (
          <p className="font-medium">
            Retorno: {formatReturnDate(prescription.returnDate)}
          </p>
        )}
      </div>
    </div>
  );
}