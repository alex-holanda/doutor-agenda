// src/app/(protected)/attendances/[attendanceId]/_components/attendance-flow.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, FileText } from "lucide-react";
import { toast } from "sonner";

import {
  startAttendance,
  getDoctorQuestionnaires,
  getAttendanceData,
  saveVitalSigns,
  savePhysicalExam,
  savePrescription,
  saveCertificate,
  completeAttendance,
  saveQuestionnaireResponse,
  saveAttendanceProgress,
  getAttendanceProgress,
} from "@/actions/attendances";
import { VitalSignsStep } from "./vital-signs-step";
import { PhysicalExamStep } from "./physical-exam-step";
import { QuestionnaireStep } from "./questionnaire-step";
import { PrescriptionStep } from "./prescription-step";
import { CertificateStep } from "./certificate-step";
import { FlowNavigation } from "./flow-navigation";

interface AttendanceFlowProps {
  attendanceId: string;
  patientName: string;
  doctorId: string;
  doctorName?: string;
  appointmentDate?: string;
  initialStatus: string;
  chiefComplaint: string | null;
}

export function AttendanceFlow({
  attendanceId,
  patientName,
  doctorId,
  doctorName,
  appointmentDate,
  initialStatus,
  chiefComplaint,
}: AttendanceFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState(initialStatus);
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [savedData, setSavedData] = useState<
    Record<string, Record<string, any>>
  >({});
  const [isLoaded, setIsLoaded] = useState(false);

  const isWaiting = status === "waiting";
  const percentage =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Salvar progresso no servidor
  const saveProgress = useCallback(
    async (step: number, data: Record<string, any>) => {
      try {
        await saveAttendanceProgress(attendanceId, step, data);
      } catch (error) {
        console.error("Erro ao salvar progresso:", error);
      }
    },
    [attendanceId],
  );

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      // Buscar questionários do médico
      const questionnaires = await getDoctorQuestionnaires(doctorId);

      // Buscar dados já salvos
      const saved = await getAttendanceData(attendanceId);

      // Buscar progresso salvo
      const progress = await getAttendanceProgress(attendanceId);

      // Construir steps dinamicamente
      const dynamicSteps = [
        { id: "vital-signs", title: "Sinais Vitais" },
        { id: "physical-exam", title: "Exame Físico" },
        ...questionnaires.map((q: any) => ({
          id: q.id,
          title: q.name,
          fields: q.fields,
        })),
        { id: "prescription", title: "Prescrição" },
        { id: "certificate", title: "Atestado" },
      ];
      setSteps(dynamicSteps);

      // Combinar dados salvos com progresso
      const combinedData: Record<string, Record<string, any>> = {
        "vital-signs": saved.vitalSigns || {},
        "physical-exam": saved.physicalExam || {},
        prescription: saved.prescription || {},
        certificate: saved.certificate || {},
        ...saved.questionnaireResponses,
        ...(progress?.progressData || {}),
      };
      setSavedData(combinedData);

      // Restaurar step salvo ou continuar do último dado preenchido
      let restoredStep = progress?.currentStep || 0;
      if (restoredStep === 0) {
        // Buscar o último step com dados
        for (let i = dynamicSteps.length - 1; i >= 0; i--) {
          const stepId = dynamicSteps[i].id as string;
          const stepData = combinedData[stepId];
          if (
            stepData &&
            typeof stepData === "object" &&
            Object.keys(stepData).length > 0
          ) {
            restoredStep = i;
            break;
          }
        }
      }

      setCurrentStep(restoredStep);
      setIsLoaded(true);
    }
    loadData();
  }, [doctorId, attendanceId]);

  // Salvar progresso quando step mudar
  useEffect(() => {
    if (isLoaded && !isWaiting && steps.length > 0) {
      saveProgress(currentStep, savedData);
    }
  }, [currentStep, isLoaded, isWaiting, steps.length, saveProgress, savedData]);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      await startAttendance(attendanceId);
      setStatus("in_progress");
      toast.success("Atendimento iniciado");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao iniciar atendimento");
    } finally {
      setIsStarting(false);
    }
  };

  const handleSaveCurrentStep = async () => {
    const step = steps[currentStep];
    if (!step) return true;

    setIsSaving(true);
    try {
      const form = document.getElementById(
        `step-form-${step.id}`,
      ) as HTMLFormElement;
      if (!form) return true;

      // Validar campos obrigatórios
      const requiredFields = form.querySelectorAll("[required]");
      let isValid = true;

      requiredFields.forEach((field: any) => {
        if (!field.value || field.value === "") {
          field.classList.add("border-red-500");
          isValid = false;
        } else {
          field.classList.remove("border-red-500");
        }
      });

      // Validar radio buttons
      const radioGroups = new Set();
      form.querySelectorAll('input[type="radio"]').forEach((radio: any) => {
        const name = radio.name;
        if (radio.required && !radioGroups.has(name)) {
          radioGroups.add(name);
          const checked = form.querySelector(
            `input[type="radio"][name="${name}"]:checked`,
          );
          if (!checked) {
            isValid = false;
          }
        }
      });

      if (!isValid) {
        toast.error("Preencha todos os campos obrigatórios");
        return false;
      }

      const formData = new FormData(form);
      const data: Record<string, any> = {};

      for (const [key, value] of formData.entries()) {
        data[key] = value;
      }

      // Chamar action apropriada
      if (step.id === "vital-signs") {
        await saveVitalSigns(attendanceId, data);
      } else if (step.id === "physical-exam") {
        await savePhysicalExam(attendanceId, data);
      } else if (step.id === "prescription") {
        await savePrescription(attendanceId, data);
      } else if (step.id === "certificate") {
        await saveCertificate(attendanceId, data);
      } else {
        await saveQuestionnaireResponse(attendanceId, step.id, data);
      }

      const newSavedData = { ...savedData, [step.id]: data };
      setSavedData(newSavedData);
      await saveProgress(currentStep, newSavedData);

      return true;
    } catch (error) {
      console.error(error);
      toast.error("Erro ao salvar");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    const saved = await handleSaveCurrentStep();
    if (saved && currentStep < steps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    const saved = await handleSaveCurrentStep();
    if (saved) {
      await completeAttendance(attendanceId);
      toast.success("Atendimento finalizado");
      router.push(`/attendances/${attendanceId}/report`);
    }
  };

  // Tela de início
  if (isWaiting) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] flex-col items-center justify-center gap-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold">
              Pronto para iniciar o atendimento?
            </h3>
            <p className="text-muted-foreground mt-2 text-sm">
              Paciente: <span className="font-medium">{patientName}</span>
            </p>
            {chiefComplaint && (
              <p className="text-muted-foreground mt-1 text-sm">
                Queixa: <span className="font-medium">{chiefComplaint}</span>
              </p>
            )}
          </div>
          <Button onClick={handleStart} disabled={isStarting} size="lg">
            <Play className="mr-2 h-4 w-4" />
            {isStarting ? "Iniciando..." : "Iniciar Atendimento"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (steps.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">Carregando...</CardContent>
      </Card>
    );
  }

  const currentStepInfo = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="space-y-6">
      {/* Queixa do Paciente */}
      {chiefComplaint && (
        <Card className="bg-muted/50 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <FileText className="text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-primary text-sm font-medium">
                  Queixa Principal
                </p>
                <p className="text-muted-foreground text-sm">
                  {chiefComplaint}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso */}
      <Card>
        <CardContent className="pt-4 md:pt-6">
          <div className="space-y-3">
            <div className="flex flex-col gap-1 text-sm sm:flex-row sm:justify-between">
              <span className="text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(percentage)}% concluído
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="overflow-x-auto">
              <div
                className="flex gap-1 text-center text-xs sm:grid"
                style={{
                  gridTemplateColumns: `repeat(${Math.min(steps.length, 6)}, 1fr)`,
                  minWidth: steps.length > 4 ? "100%" : undefined,
                }}
              >
                {steps.map((step, index) => (
                  <div
                    key={step.id}
                    className={`truncate px-0.5 py-1 ${
                      index <= currentStep
                        ? "text-primary font-medium"
                        : "text-muted-foreground"
                    }`}
                  >
                    {step.title.length > 10
                      ? step.title.substring(0, 8) + "..."
                      : step.title}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário do passo atual */}
      <form
        id={`step-form-${currentStepInfo.id}`}
        onSubmit={(e) => e.preventDefault()}
      >
        {currentStepInfo.id === "vital-signs" && (
          <VitalSignsStep initialData={savedData["vital-signs"]} />
        )}
        {currentStepInfo.id === "physical-exam" && (
          <PhysicalExamStep initialData={savedData["physical-exam"]} />
        )}
        {currentStepInfo.id !== "vital-signs" &&
          currentStepInfo.id !== "physical-exam" &&
          currentStepInfo.id !== "prescription" &&
          currentStepInfo.id !== "certificate" && (
            <QuestionnaireStep
              fields={currentStepInfo.fields || []}
              title={currentStepInfo.title}
              initialData={savedData[currentStepInfo.id]}
            />
          )}
        {currentStepInfo.id === "prescription" && (
          <PrescriptionStep
            initialData={savedData.prescription}
            doctorName={doctorName}
            appointmentDate={appointmentDate}
            doctorId={doctorId}
          />
        )}
        {currentStepInfo.id === "certificate" && (
          <CertificateStep initialData={savedData.certificate} />
        )}
      </form>

      {/* Navegação */}
      <FlowNavigation
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onComplete={handleComplete}
        isLastStep={isLastStep}
        isSaving={isSaving}
      />
    </div>
  );
}
