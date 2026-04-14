import { eq, ne } from "drizzle-orm";
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

  const [patients, doctors, appointments] = await Promise.all([
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session!.user.clinic!.id),
    }),
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session!.user.clinic!.id),
    }),
    db.query.appointmentsTable.findMany({
      where: eq(appointmentsTable.clinicId, session!.user.clinic!.id),
      with: {
        patient: true,
        doctor: true,
      },
    }),
  ]);

  const filteredAppointments = appointments.filter((apt) => {
    if (!status) {
      return apt.status !== "cancelled";
    }
    if (status === "completed") {
      return apt.status === "completed";
    }
    if (status === "cancelled") {
      return apt.status === "cancelled";
    }
    return true;
  });

  const statusOptions = [
    { value: undefined, label: "Ativos", href: "/appointments" },
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
  ];

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Agendamentos</PageTitle>
            <PageDescription>
              {!status
                ? "Agendamentos ativos"
                : status === "completed"
                  ? "Agendamentos realizados"
                  : status === "cancelled"
                    ? "Agendamentos cancelados"
                    : "Todos os agendamentos"}
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddAppointmentButton patients={patients} doctors={doctors} />
          </PageActions>
        </PageHeader>
        <div className="flex flex-wrap gap-2 pb-4">
          {statusOptions.map((option) => (
            <Button
              key={option.value ?? "active"}
              variant={status === option.value ? "default" : "outline"}
              size="sm"
              asChild
            >
              <Link href={option.href}>{option.label}</Link>
            </Button>
          ))}
        </div>
        <PageContent>
          <DataTable
            data={filteredAppointments}
            columns={appointmentsTableColumns}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default AppointmentsPage;
