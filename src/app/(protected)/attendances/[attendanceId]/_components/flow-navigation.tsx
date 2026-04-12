// src/app/(protected)/attendances/[attendanceId]/_components/flow-navigation.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, CheckCircle } from "lucide-react";

interface FlowNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onComplete: () => void;
  isLastStep: boolean;
  isSaving: boolean;
}

export function FlowNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onComplete,
  isLastStep,
  isSaving,
}: FlowNavigationProps) {
  return (
    <div className="flex justify-between pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isSaving}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      {!isLastStep ? (
        <Button type="button" onClick={onNext} disabled={isSaving}>
          {isSaving ? "Salvando..." : "Próximo"}
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isSaving}
          className="bg-green-600 hover:bg-green-700"
        >
          <CheckCircle className="mr-2 h-4 w-4" />
          {isSaving ? "Finalizando..." : "Finalizar Atendimento"}
        </Button>
      )}
    </div>
  );
}
