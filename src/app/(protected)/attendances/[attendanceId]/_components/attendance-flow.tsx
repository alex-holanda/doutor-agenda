// src/app/(protected)/attendances/[attendanceId]/_components/attendance-flow.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play } from "lucide-react";
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
  initialStatus: string;
  chiefComplaint: string | null;
}

export function AttendanceFlow({
  attendanceId,
  patientName,
  doctorId,
  initialStatus,
  chiefComplaint,
}: AttendanceFlowProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState(initialStatus);
  const [isStarting, setIsStarting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [steps, setSteps] = useState<any[]>([]);
  const [savedData, setSavedData] = useState<Record<string, any>>({});

  const isWaiting = status === "waiting";
  const percentage =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      // Buscar questionários do médico
      const questionnaires = await getDoctorQuestionnaires(doctorId);

      // Buscar dados já salvos
      const saved = await getAttendanceData(attendanceId);
      setSavedData({
        vitalSigns: saved.vitalSigns,
        physicalExam: saved.physicalExam,
        prescription: saved.prescription,
        certificate: saved.certificate,
        ...saved.questionnaireResponses,
      });

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
    }
    loadData();
  }, [doctorId, attendanceId]);

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

  // Dentro do handleSaveCurrentStep, adicione validação

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

      setSavedData((prev) => ({ ...prev, [step.id]: data }));
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
      setCurrentStep(currentStep + 1);
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
      {/* Progresso */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Passo {currentStep + 1} de {steps.length}
              </span>
              <span className="text-muted-foreground">
                {Math.round(percentage)}% concluído
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div
              className="grid gap-2 text-center text-xs"
              style={{
                gridTemplateColumns: `repeat(${Math.min(steps.length, 6)}, 1fr)`,
              }}
            >
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`truncate ${
                    index <= currentStep
                      ? "text-primary font-medium"
                      : "text-muted-foreground"
                  }`}
                >
                  {step.title.length > 12
                    ? step.title.substring(0, 10) + "..."
                    : step.title}
                </div>
              ))}
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
          <VitalSignsStep initialData={savedData.vitalSigns} />
        )}
        {currentStepInfo.id === "physical-exam" && (
          <PhysicalExamStep initialData={savedData.physicalExam} />
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
          <PrescriptionStep initialData={savedData.prescription} />
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
