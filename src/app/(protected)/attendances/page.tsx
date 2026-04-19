import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/lib/auth";
import WithAuthentication from "@/hocs/with-authentication";
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
import { DataTable } from "@/components/ui/data-table";
import { attendanceTableColumns } from "./_components/table-columns";
import { db } from "@/db";
import AddAttendanceButton from "./_components/add-attendence-button";
import { attendancesTable, professionalsTable, patientsTable } from "@/db/schema";
import { and, asc, eq, gte, lte, or } from "drizzle-orm";
import dayjs from "dayjs";

interface AttendancesPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export default async function AttendancesPage({
  searchParams,
}: AttendancesPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const { status } = await searchParams;

  const today = dayjs().startOf("day").toDate();
  const tomorrow = dayjs().add(1, "day").startOf("day").toDate();

  const baseFilter = and(
    eq(attendancesTable.clinicId, session!.user.clinic!.id),
    gte(attendancesTable.createdAt, today),
    lte(attendancesTable.createdAt, tomorrow),
  );

  let whereClause;
  if (!status) {
    whereClause = and(
      baseFilter,
      or(
        eq(attendancesTable.status, "waiting"),
        eq(attendancesTable.status, "in_progress"),
      ),
    );
  } else if (status === "all") {
    whereClause = baseFilter;
  } else {
    whereClause = and(baseFilter, eq(attendancesTable.status, status as any));
  }

  const [attendances, patients, doctors] = await Promise.all([
    db.query.attendancesTable.findMany({
      where: whereClause,
      orderBy: [asc(attendancesTable.createdAt)],
      with: {
        doctor: {
          columns: {
            id: true,
            name: true,
            specialty: true,
          },
        },
        patient: {
          columns: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            sex: true,
          },
        },
        appointment: {
          columns: {
            date: true,
          },
        },
      },
    }),
    db.query.patientsTable.findMany({
      where: eq(patientsTable.clinicId, session!.user.clinic!.id),
    }),
    db.query.professionalsTable.findMany({
      where: eq(professionalsTable.clinicId, session!.user.clinic!.id),
    }),
  ]);

  const statusOptions = [
    { value: undefined, label: "Ativos", href: "/attendances" },
    {
      value: "completed",
      label: "Finalizados",
      href: "/attendances?status=completed",
    },
    {
      value: "cancelled",
      label: "Cancelados",
      href: "/attendances?status=cancelled",
    },
    { value: "all", label: "Todos", href: "/attendances?status=all" },
  ];

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Atendimentos</PageTitle>
            <PageDescription>
              {!status
                ? "Ativos (aguardando e em andamento)"
                : status === "completed"
                  ? "Finalizados"
                  : status === "cancelled"
                    ? "Cancelados"
                    : "Todos os atendimentos"}
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddAttendanceButton professionals={doctors} patients={patients} />
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
          <DataTable data={attendances} columns={attendanceTableColumns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
