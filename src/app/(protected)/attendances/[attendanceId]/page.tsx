// src/app/(protected)/attendances/[attendanceId]/page.tsx
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
import { Badge } from "@/components/ui/badge";
import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { AttendanceFlow } from "./_components/attendance-flow";

interface AttendancePageProps {
  params: Promise<{
    attendanceId: string;
  }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
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
      doctor: true,
      patient: true,
      appointment: true,
    },
  });

  if (!attendance) {
    notFound();
  }

  const typeConfig = {
    scheduled: { label: "Agendado", variant: "default" as const },
    walk_in: { label: "Avulso", variant: "outline" as const },
    emergency: { label: "Emergência", variant: "destructive" as const },
  };

  const type = typeConfig[attendance.type as keyof typeof typeConfig];

  if (attendance.status === "completed") {
    redirect(`/attendances/${attendanceId}/report`);
  }

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Atendimento Médico</PageTitle>
            <PageDescription>
              {attendance.patient.name} - {attendance.doctor.specialty}
            </PageDescription>
          </PageHeaderContent>
          <div className="flex gap-2">
            <Badge variant={type.variant}>{type.label}</Badge>
            <Badge variant="outline">
              {attendance.status === "waiting" && "Aguardando"}
              {attendance.status === "in_progress" && "Em andamento"}
            </Badge>
          </div>
        </PageHeader>
        <PageContent>
          <AttendanceFlow
            attendanceId={attendance.id}
            patientName={attendance.patient.name}
            doctorId={attendance.doctor.id}
            initialStatus={attendance.status}
            chiefComplaint={attendance.chiefComplaint}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
