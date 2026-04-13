// app/(protected)/attendances/[attendanceId]/start/page.tsx
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import WithAuthentication from "@/hocs/with-authentication";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import { Card, CardContent } from "@/components/ui/card";
import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { StartAttendanceForm } from "./_components/start-attendance-form";

interface StartAttendancePageProps {
  params: Promise<{
    attendanceId: string;
  }>;
}

export default async function StartAttendancePage({
  params,
}: StartAttendancePageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const { attendanceId } = await params;

  const attendance = await db.query.attendancesTable.findFirst({
    where: and(
      eq(attendancesTable.id, attendanceId),
      eq(attendancesTable.clinicId, session.user.clinic?.id!),
    ),
    with: {
      patient: true,
      doctor: true,
    },
  });

  if (!attendance) {
    notFound();
  }

  if (attendance.status !== "waiting") {
    redirect(`/attendances/${attendanceId}`);
  }

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Iniciar Atendimento</PageTitle>
            <PageDescription>
              Confirme os dados e inicie o atendimento
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <StartAttendanceForm
            attendanceId={attendance.id}
            patientName={attendance.patient.name}
            doctorName={attendance.doctor.name}
            chiefComplaint={attendance.chiefComplaint}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
