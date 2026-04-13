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
    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-between md:pt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 0 || isSaving}
        className="w-full sm:w-auto"
      >
        <ChevronLeft className="mr-1 h-4 w-4 sm:mr-2" />
        <span className="hidden sm:inline">Voltar</span>
      </Button>

      {!isLastStep ? (
        <Button
          type="button"
          onClick={onNext}
          disabled={isSaving}
          className="w-full sm:w-auto"
        >
          <span className="hidden sm:inline">
            {isSaving ? "Salvando..." : "Próximo"}
          </span>
          <span className="sm:hidden">{isSaving ? "Salvando" : "Próximo"}</span>
          <ChevronRight className="ml-1 h-4 w-4 sm:ml-2" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onComplete}
          disabled={isSaving}
          className="w-full bg-green-600 hover:bg-green-700 sm:w-auto"
        >
          <CheckCircle className="mr-1 h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">
            {isSaving ? "Finalizando..." : "Finalizar Atendimento"}
          </span>
          <span className="sm:hidden">
            {isSaving ? "Finalizando" : "Finalizar"}
          </span>
        </Button>
      )}
    </div>
  );
}
