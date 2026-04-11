// app/attendances/[attendanceId]/_components/complete-attendance-button.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { completeAttendance } from "@/actions/complete-attendance";
import { checkQuestionnairesCompletion } from "@/actions/check-questionnaires-completion";

interface CompleteAttendanceButtonProps {
  attendanceId: string;
}

export function CompleteAttendanceButton({
  attendanceId,
}: CompleteAttendanceButtonProps) {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingQuestionnaires, setPendingQuestionnaires] = useState<string[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      const checkResult = await checkQuestionnairesCompletion({ attendanceId });

      if (checkResult?.hasPending) {
        setPendingQuestionnaires(checkResult.pendingQuestionnaires || []);
        setShowConfirmDialog(true);
      } else {
        await completeAttendance({ attendanceId });
        toast.success("Atendimento finalizado com sucesso");
        router.refresh();
      }
    } catch (error) {
      toast.error("Erro ao verificar questionários");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceComplete = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);
    try {
      await completeAttendance({ attendanceId });
      toast.success("Atendimento finalizado com sucesso");
      router.refresh();
    } catch (error) {
      toast.error("Erro ao finalizar atendimento");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button size="lg" onClick={handleComplete} disabled={isLoading}>
        <CheckCircle className="mr-2 h-4 w-4" />
        {isLoading ? "Verificando..." : "Finalizar atendimento"}
      </Button>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Questionários pendentes
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div>
                <p className="mb-2">
                  Os seguintes questionários não foram preenchidos:
                </p>
                <ul className="mb-4 list-disc pl-5">
                  {pendingQuestionnaires.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
                <p className="text-foreground font-medium">
                  Deseja finalizar o atendimento mesmo assim?
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Os questionários não preenchidos ficarão em branco.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleForceComplete}>
              Sim, finalizar mesmo assim
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
