// src/app/(protected)/attendances/[attendanceId]/print/page.tsx
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import {
  PageContainer,
  PageContent,
  PageHeader,
  PageHeaderContent,
  PageTitle,
  PageDescription,
} from "@/components/ui/page-container";
import { db } from "@/db";
import {
  attendancesTable,
  vitalSignsTable,
  physicalExamsTable,
  prescriptionsTable,
  questionnaireResponsesTable,
  questionnaireTemplatesTable,
  questionnaireTemplateFieldsTable,
  professionalsTable,
  patientsTable,
} from "@/db/schema";

import { PrintContent } from "./_components/print-content";

interface PrintPageProps {
  params: Promise<{
    attendanceId: string;
  }>;
}

export default async function PrintPage({ params }: PrintPageProps) {
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
    where: eq(attendancesTable.id, attendanceId),
    with: {
      patient: true,
      doctor: true,
    },
  });

  if (!attendance) {
    notFound();
  }

  if (attendance.clinicId !== session.user.clinic.id) {
    notFound();
  }

  const [vitalSigns, physicalExam, prescription] = await Promise.all([
    db.query.vitalSignsTable.findFirst({
      where: eq(vitalSignsTable.attendanceId, attendanceId),
    }),
    db.query.physicalExamsTable.findFirst({
      where: eq(physicalExamsTable.attendanceId, attendanceId),
    }),
    db.query.prescriptionsTable.findFirst({
      where: eq(prescriptionsTable.attendanceId, attendanceId),
    }),
  ]);

  const questionnairesWithFields: any[] = [];

  const attendanceData = {
    ...attendance,
  };

  return (
    <PageContainer>
      <PageContent>
        <PrintContent
          attendance={attendanceData}
          vitalSigns={vitalSigns || null}
          physicalExam={physicalExam || null}
          prescription={prescription || null}
          questionnaires={questionnairesWithFields}
        />
      </PageContent>
    </PageContainer>
  );
}
