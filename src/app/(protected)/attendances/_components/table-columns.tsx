// app/(protected)/attendances/_components/table-columns.tsx
"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Ban,
  CheckCircle2,
  Clock,
  Eye,
  UserRound,
  XCircle,
} from "lucide-react";

type AttendanceWithRelations = {
  id: string;
  createdAt: Date;
  updatedAt: Date | null;
  clinicId: string;
  patientId: string;
  doctorId: string;
  appointmentId: string | null;
  type: "scheduled" | "walk_in" | "emergency";
  status: "waiting" | "in_progress" | "completed" | "cancelled" | "no_show";
  scheduledStartTime: Date | null;
  actualStartTime: Date | null;
  actualEndTime: Date | null;
  chiefComplaint: string | null;
  notes: string | null;
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
  } | null;
};

export const attendanceTableColumns: ColumnDef<AttendanceWithRelations>[] = [
  {
    id: "patient",
    accessorKey: "patient.name",
    header: "Paciente",
    cell: ({ row }) => {
      return row.original.patient.name;
    },
  },
  {
    id: "doctor",
    accessorKey: "doctor.name",
    header: "Médico",
    cell: ({ row }) => {
      return row.original.doctor.name;
    },
  },
  {
    id: "date",
    header: "Data e Hora",
    cell: ({ row }) => {
      const attendance = row.original;

      if (attendance.appointment?.date) {
        return format(
          new Date(attendance.appointment.date),
          "dd/MM/yyyy 'às' HH:mm",
          {
            locale: ptBR,
          },
        );
      }

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

      const statusText = {
        waiting: "Aguardando",
        in_progress: "Em atendimento",
        completed: "Concluído",
        cancelled: "Cancelado",
        no_show: "Não compareceu",
      };

      return (
        <Badge className={style}>
          <Icon className="mr-1 h-3 w-3" />
          {statusText[status]}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const attendance = row.original;
      return (
        <Link href={`/attendances/${attendance.id}`}>
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
      );
    },
  },
];
