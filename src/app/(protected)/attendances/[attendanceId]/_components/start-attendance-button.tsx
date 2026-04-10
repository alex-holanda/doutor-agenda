// app/attendances/[attendanceId]/components/start-attendance-button.tsx
"use client";

import { Play } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { startAttendance } from "@/actions/start-attendance";

interface StartAttendanceButtonProps {
  attendanceId: string;
}

export function StartAttendanceButton({
  attendanceId,
}: StartAttendanceButtonProps) {
  const router = useRouter();

  const { execute, isPending } = useAction(startAttendance, {
    onSuccess: () => {
      toast.success("Atendimento iniciado");
      router.refresh();
    },
    onError: () => {
      toast.error("Erro ao iniciar atendimento");
    },
  });

  return (
    <Button onClick={() => execute({ attendanceId })} disabled={isPending}>
      <Play className="mr-2 h-4 w-4" />
      {isPending ? "Iniciando..." : "Iniciar atendimento"}
    </Button>
  );
}
