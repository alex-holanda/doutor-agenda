"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { appointmentsTable } from "@/db/schema";

import AppointmentsTableActions from "./table-actions";
import { Badge } from "@/components/ui/badge";

type AppointmentWithRelations = typeof appointmentsTable.$inferSelect & {
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
};

export const appointmentsTableColumns: ColumnDef<AppointmentWithRelations>[] = [
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
    cell: (params) => {
      const appointment = params.row.original;
      return format(new Date(appointment.date), "dd/MM/yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    },
  },
  {
    id: "specialty",
    accessorKey: "doctor.specialty",
    header: "Especialidade",
  },
  {
    id: "price",
    accessorKey: "appointmentPriceInCents",
    header: "Valor",
    cell: (params) => {
      const appointment = params.row.original;
      const price = appointment.appointmentPriceInCents / 100;
      return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(price);
    },
  },
  {
    id: "status",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;

      const statusConfig = {
        scheduled: {
          label: "Agendado",
          variant: "default" as const,
          className:
            "bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200",
        },
        completed: {
          label: "Realizado",
          variant: "default" as const,
          className:
            "bg-green-100 text-green-800 hover:bg-green-100 border-green-200",
        },
        cancelled: {
          label: "Cancelado",
          variant: "destructive" as const,
          className: "bg-red-100 text-red-800 hover:bg-red-100 border-red-200",
        },
        confirmed: {
          label: "Confirmado",
          variant: "default" as const,
          className:
            "bg-purple-100 text-purple-800 hover:bg-purple-100 border-purple-200",
        },
      };

      const config = statusConfig[status as keyof typeof statusConfig] || {
        label: status,
        variant: "secondary" as const,
        className: "",
      };

      return (
        <Badge variant={config.variant} className={config.className}>
          {config.label}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: (params) => {
      const appointment = params.row.original;
      return <AppointmentsTableActions appointment={appointment} />;
    },
  },
];
