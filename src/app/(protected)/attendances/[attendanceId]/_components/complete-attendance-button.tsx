// app/(protected)/attendances/[attendanceId]/_components/complete-attendance-button.tsx
"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { completeAttendance } from "@/actions/complete-attendance";

interface CompleteAttendanceButtonProps {
  attendanceId: string;
}

export function CompleteAttendanceButton({
  attendanceId,
}: CompleteAttendanceButtonProps) {
  const router = useRouter();

  const { execute, isPending } = useAction(completeAttendance, {
    onSuccess: () => {
      toast.success("Atendimento finalizado com sucesso");
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao finalizar atendimento");
    },
  });

  return (
    <Button
      size="lg"
      onClick={() => execute({ attendanceId })}
      disabled={isPending}
    >
      <CheckCircle className="mr-2 h-4 w-4" />
      {isPending ? "Finalizando..." : "Finalizar atendimento"}
    </Button>
  );
}
