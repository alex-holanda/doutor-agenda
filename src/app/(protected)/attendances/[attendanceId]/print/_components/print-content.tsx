// src/app/(protected)/attendances/[attendanceId]/print/_components/print-content.tsx

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Separator } from "@/components/ui/separator";

interface PrintContentProps {
  attendance: any;
  vitalSigns: any;
  physicalExam: any;
  prescription: any;
  questionnaires: any[];
}

export function PrintContent({
  attendance,
  vitalSigns,
  physicalExam,
  prescription,
  questionnaires,
}: PrintContentProps) {
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

  const hasVitalSigns = (vs: any) => {
    return (
      vs?.bloodPressureSystolic ||
      vs?.bloodPressureDiastolic ||
      vs?.heartRate ||
      vs?.respiratoryRate ||
      vs?.temperature ||
      vs?.oxygenSaturation ||
      vs?.bloodGlucose ||
      vs?.weight ||
      vs?.height ||
      vs?.bmi ||
      vs?.abdominalCircumference ||
      vs?.hipCircumference ||
      vs?.waistHipRatio ||
      vs?.armCircumference ||
      vs?.calfCircumference ||
      vs?.painScale
    );
  };

  const hasPhysicalExam = (pe: any) => {
    return (
      pe?.generalState ||
      pe?.consciousnessLevel ||
      pe?.hydration ||
      pe?.skinColor ||
      pe?.lungAuscultation ||
      pe?.heartAuscultation ||
      pe?.abdomen ||
      pe?.extremities
    );
  };

  const hasPrescription = (p: any) => {
    return p?.medications || p?.exams || p?.orientations;
  };

  const showVitalSigns = hasVitalSigns(vitalSigns);
  const showPhysicalExam = hasPhysicalExam(physicalExam);
  const showQuestionnaires = questionnaires.length > 0;
  const showPrescription = hasPrescription(prescription);

  const sections = [
    showVitalSigns,
    showPhysicalExam,
    showQuestionnaires,
    showPrescription,
  ].filter(Boolean).length;

  if (sections === 0) {
    return (
      <div className="mx-auto max-w-2xl p-4 text-sm">
        <div className="mb-4 text-center">
          <h1 className="text-lg font-bold">RELATÓRIO DE ATENDIMENTO</h1>
          <p className="text-sm">Dr(a). {attendance.doctor?.name}</p>
          <p className="text-muted-foreground text-xs">{attendanceDate}</p>
        </div>
        <div className="mb-4">
          <p>
            <span className="font-medium">Paciente:</span>{" "}
            {attendance.patient?.name}
          </p>
        </div>
        <Separator className="my-4" />
        <div className="text-center text-xs">
          <p className="font-medium">{attendance.doctor?.name}</p>
          <p>{attendanceDateOnly}</p>
        </div>
      </div>
    );
  }

  let sectionIndex = 0;

  return (
    <div className="mx-auto max-w-2xl p-4 text-sm">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-lg font-bold">RELATÓRIO DE ATENDIMENTO</h1>
        <p className="text-sm">Dr(a). {attendance.doctor?.name}</p>
        <p className="text-muted-foreground text-xs">{attendanceDate}</p>
      </div>

      <div className="mb-4">
        <p>
          <span className="font-medium">Paciente:</span>{" "}
          {attendance.patient?.name}
        </p>
        {prescription?.returnDate && (
          <p className="font-medium">
            Retorno: {formatReturnDate(prescription.returnDate)}
          </p>
        )}
      </div>

      {/* Sinais Vitais */}
      {showVitalSigns && (
        <>
          <Separator className="my-3" />
          <div className="mb-4">
            <p className="mb-1 font-medium">Sinais Vitais</p>
            <div className="space-y-1">
              {vitalSigns.bloodPressureSystolic && (
                <p>
                  Pressão Arterial: {vitalSigns.bloodPressureSystolic}/
                  {vitalSigns.bloodPressureDiastolic} mmHg
                </p>
              )}
              {vitalSigns.heartRate && (
                <p>Frequência Cardíaca: {vitalSigns.heartRate} bpm</p>
              )}
              {vitalSigns.respiratoryRate && (
                <p>Frequência Respiratória: {vitalSigns.respiratoryRate} rpm</p>
              )}
              {vitalSigns.temperature && (
                <p>Temperatura: {vitalSigns.temperature} °C</p>
              )}
              {vitalSigns.oxygenSaturation && (
                <p>Saturação de Oxigênio: {vitalSigns.oxygenSaturation}%</p>
              )}
              {vitalSigns.bloodGlucose && (
                <p>Glicemia: {vitalSigns.bloodGlucose} mg/dL</p>
              )}
              {(vitalSigns.weight || vitalSigns.height) && (
                <p>
                  Peso: {vitalSigns.weight} kg | Altura: {vitalSigns.height} cm
                  {vitalSigns.bmi && ` | IMC: ${vitalSigns.bmi} kg/m²`}
                </p>
              )}
              {vitalSigns.abdominalCircumference && (
                <p>
                  Circunferência Abdominal: {vitalSigns.abdominalCircumference}{" "}
                  cm
                </p>
              )}
              {vitalSigns.hipCircumference && (
                <p>Circunferência Quadril: {vitalSigns.hipCircumference} cm</p>
              )}
              {vitalSigns.waistHipRatio && (
                <p>Relação Cintura/Quadril: {vitalSigns.waistHipRatio}</p>
              )}
              {vitalSigns.armCircumference && (
                <p>Circunferência do Braço: {vitalSigns.armCircumference} cm</p>
              )}
              {vitalSigns.calfCircumference && (
                <p>
                  Circunferência da Panturrilha: {vitalSigns.calfCircumference}{" "}
                  cm
                </p>
              )}
              {vitalSigns.painScale !== undefined &&
                vitalSigns.painScale !== null && (
                  <p>Escala de Dor: {vitalSigns.painScale}/10</p>
                )}
              {vitalSigns.notes && <p>Observações: {vitalSigns.notes}</p>}
            </div>
          </div>
        </>
      )}

      {/* Exame Físico */}
      {showPhysicalExam && (
        <>
          <Separator className="my-3" />
          <div className="mb-4">
            <p className="mb-1 font-medium">Exame Físico</p>
            <div className="space-y-1">
              {physicalExam.generalState && (
                <p>Estado Geral: {physicalExam.generalState}</p>
              )}
              {physicalExam.consciousnessLevel && (
                <p>Nível de Consciência: {physicalExam.consciousnessLevel}</p>
              )}
              {physicalExam.hydration && (
                <p>Hidratação: {physicalExam.hydration}</p>
              )}
              {physicalExam.skinColor && <p>Pele: {physicalExam.skinColor}</p>}
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
        </>
      )}

      {/* Questionários */}
      {showQuestionnaires && (
        <>
          <Separator className="my-3" />
          <div className="mb-4">
            {questionnaires.map((q) => (
              <div key={q.id} className="mb-3">
                <p className="font-medium">{q.name}</p>
                <div className="space-y-1">
                  {q.fields?.map((field: any) => {
                    const value = q.responseData?.[field.fieldKey];
                    if (!value) return null;
                    return (
                      <p key={field.id}>
                        {field.label || field.name}: {value}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Prescrição */}
      {showPrescription && (
        <>
          <Separator className="my-3" />
          <div className="mb-4">
            <p className="mb-1 font-medium">Prescrição</p>
            <div className="space-y-2">
              {prescription?.medications && (
                <div>
                  <p className="text-xs font-medium">Medicamentos:</p>
                  <div className="whitespace-pre-wrap">
                    {prescription.medications}
                  </div>
                </div>
              )}
              {prescription?.exams && (
                <div>
                  <p className="text-xs font-medium">Exames Solicitados:</p>
                  <div className="whitespace-pre-wrap">
                    {prescription.exams}
                  </div>
                </div>
              )}
              {prescription?.orientations && (
                <div>
                  <p className="text-xs font-medium">Orientações:</p>
                  <div className="whitespace-pre-wrap">
                    {prescription.orientations}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
