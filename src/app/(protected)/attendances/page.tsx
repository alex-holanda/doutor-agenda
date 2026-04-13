import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
import { DataTable } from "@/components/ui/data-table";
import { attendanceTableColumns } from "./_components/table-columns";
import { db } from "@/db";
import AddAttendanceButton from "./_components/add-attendence-button";
import { doctorsTable, patientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function AttendancesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const [attendances, patients, doctors] = await Promise.all([
    db.query.attendancesTable.findMany({
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
    db.query.doctorsTable.findMany({
      where: eq(doctorsTable.clinicId, session!.user.clinic!.id),
    }),
  ]);

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Atendimentos</PageTitle>
            <PageDescription>Gerenciamento de atendimentos</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddAttendanceButton doctors={doctors} patients={patients} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <DataTable data={attendances} columns={attendanceTableColumns} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
