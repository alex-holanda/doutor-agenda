import { and, eq, gte, lt, desc, asc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { DataTable } from "@/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { appointmentsTable, doctorsTable, patientsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddAppointmentButton from "./_components/add-appointment-button";
import { appointmentsTableColumns } from "./_components/table-columns";

interface AppointmentsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

const AppointmentsPage = async ({ searchParams }: AppointmentsPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const { status } = await searchParams;
  // Default: scheduled se não houver status
  const currentStatus = status || "scheduled";

  // Definir período do dia atual para agendamentos futuros
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const endOfToday = new Date(startOfToday);
  endOfToday.setDate(endOfToday.getDate() + 1);

  // Buscar pacientes e médicos
  const [patients, doctors] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session.user.clinic.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session.user.clinic.id),
    }),
  ]);

  // Construir condições de busca
  let conditions = [eq(appointmentsTable.clinicId, session.user.clinic.id)];
  let orderBy: any = [asc(appointmentsTable.date)];

  if (currentStatus === "completed") {
    // Realizados: todos os agendamentos concluídos
    conditions.push(eq(appointmentsTable.status, "completed"));
    orderBy = [desc(appointmentsTable.date)];
  } else if (currentStatus === "cancelled") {
    // Cancelados: todos os agendamentos cancelados
    conditions.push(eq(appointmentsTable.status, "cancelled"));
    orderBy = [desc(appointmentsTable.date)];
  } else if (currentStatus === "all") {
    // Todos: todos os agendamentos (qualquer status)
    // Sem filtro de status
    orderBy = [desc(appointmentsTable.date)];
  } else {
    // Scheduled (default): apenas os do dia atual
    conditions.push(
      gte(appointmentsTable.date, startOfToday),
      lt(appointmentsTable.date, endOfToday),
      eq(appointmentsTable.status, "scheduled"),
    );
    orderBy = [asc(appointmentsTable.date)];
  }

  const appointments = await db.query.appointmentsTable.findMany({
    where: and(...conditions),
    with: {
      patient: true,
      doctor: true,
    },
    orderBy,
  });

  const statusOptions = [
    {
      value: "scheduled",
      label: "Agendados",
      href: "/appointments?status=scheduled",
    },
    {
      value: "completed",
      label: "Realizados",
      href: "/appointments?status=completed",
    },
    {
      value: "cancelled",
      label: "Cancelados",
      href: "/appointments?status=cancelled",
    },
    { value: "all", label: "Todos", href: "/appointments?status=all" },
  ];

  const getPageTitle = () => {
    if (currentStatus === "completed") return "Agendamentos Realizados";
    if (currentStatus === "cancelled") return "Agendamentos Cancelados";
    if (currentStatus === "all") return "Todos os Agendamentos";
    return "Agendamentos";
  };

  const getPageDescription = () => {
    if (currentStatus === "completed")
      return "Histórico de consultas realizadas";
    if (currentStatus === "cancelled")
      return "Histórico de consultas canceladas";
    if (currentStatus === "all") return "Todos os agendamentos da clínica";
    return "Agendamentos para hoje";
  };

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>{getPageTitle()}</PageTitle>
            <PageDescription>{getPageDescription()}</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddAppointmentButton patients={patients} doctors={doctors} />
          </PageActions>
        </PageHeader>
        <div className="flex flex-wrap gap-2 pb-4">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={currentStatus === option.value ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={option.href}>{option.label}</Link>
            </Button>
          ))}
        </div>
        <PageContent>
          <DataTable data={appointments} columns={appointmentsTableColumns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AppointmentsPage;
