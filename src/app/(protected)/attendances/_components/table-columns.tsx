"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { attendancesTable } from "@/db/schema";
import { Badge } from "@/components/ui/badge";
import { Ban, CheckCircle2, Clock, UserRound, XCircle } from "lucide-react";

type AttendanceWithRelations = typeof attendancesTable.$inferSelect & {
  patient: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    sex: "male" | "female";
  };
  doctor: {
    id: string;
    name: string;
    specialty: string;
  };
  appointment: {
    date: Date;
  };
};

export const attendanceTableColumns: ColumnDef<AttendanceWithRelations>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Médico",
    cell: (params) => {
      const appointment = params.row.original;
      return `${appointment.doctor.name}`;
    },
  },
  {
    id: "date",
    accessorKey: "date",
    header: "Data e Hora",
    cell: ({ row }) => {
      const attendance = row.original;

      // Se tem agendamento, mostra a data do agendamento
      if (attendance.appointment?.date) {
        return format(
          new Date(attendance.appointment.date),
          "dd/MM/yyyy 'às' HH:mm",
          {
            locale: ptBR,
          },
        );
      }

      // Se não tem agendamento, mostra o tipo (avulso/emergência)
      if (attendance.type === "emergency") {
        return <Badge variant="destructive">Emergência</Badge>;
      }

      if (attendance.type === "walk_in") {
        return <Badge variant="outline">Avulso</Badge>;
      }

      return <Badge variant="secondary">Não agendado</Badge>;
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusStyles = {
        waiting: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100",
        in_progress: "bg-blue-100 text-blue-800 hover:bg-blue-100",
        completed: "bg-green-100 text-green-800 hover:bg-green-100",
        cancelled: "bg-red-100 text-red-800 hover:bg-red-100",
        no_show: "bg-gray-100 text-gray-800 hover:bg-gray-100",
      };

      const icons = {
        waiting: Clock,
        in_progress: UserRound,
        completed: CheckCircle2,
        cancelled: XCircle,
        no_show: Ban,
      };

      const Icon = icons[status as keyof typeof icons];
      const style = statusStyles[status as keyof typeof statusStyles];

      return (
        <Badge className={style}>
          <Icon className="mr-1 h-3 w-3" />
          {status === "waiting" && "Aguardando"}
          {status === "in_progress" && "Em atendimento"}
          {status === "completed" && "Concluído"}
          {status === "cancelled" && "Cancelado"}
          {status === "no_show" && "Não compareceu"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const attendance = params.row.original;
      return <></>;
    },
  },
];
