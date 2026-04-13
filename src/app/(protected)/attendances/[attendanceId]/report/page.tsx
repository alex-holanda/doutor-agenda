// src/app/(protected)/attendances/[attendanceId]/report/page.tsx
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
import { db } from "@/db";
import {
  attendancesTable,
  vitalSignsTable,
  physicalExamsTable,
  prescriptionsTable,
  medicalCertificatesTable,
  questionnaireResponsesTable,
  questionnairesTable,
  questionnaireTemplatesTable,
  questionnaireTemplateFieldsTable,
} from "@/db/schema";

import { ReportContent } from "./_components/report-content";

interface ReportPageProps {
  params: Promise<{
    attendanceId: string;
  }>;
}

export default async function ReportPage({ params }: ReportPageProps) {
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

  if (attendance.status !== "completed") {
    redirect(`/attendances/${attendanceId}`);
  }

  const [vitalSigns, physicalExam, prescription, certificate] =
    await Promise.all([
      db.query.vitalSignsTable.findFirst({
        where: eq(vitalSignsTable.attendanceId, attendanceId),
      }),
      db.query.physicalExamsTable.findFirst({
        where: eq(physicalExamsTable.attendanceId, attendanceId),
      }),
      db.query.prescriptionsTable.findFirst({
        where: eq(prescriptionsTable.attendanceId, attendanceId),
      }),
      db.query.medicalCertificatesTable.findFirst({
        where: eq(medicalCertificatesTable.attendanceId, attendanceId),
      }),
    ]);

  const questionnaireResponses =
    await db.query.questionnaireResponsesTable.findMany({
      where: eq(questionnaireResponsesTable.attendanceId, attendanceId),
    });

  const questionnairesWithDetails = await Promise.all(
    questionnaireResponses.map(async (response) => {
      // Verificar se questionnaireId existe
      if (!response.questionnaireId) {
        return null;
      }

      const doctorQuestionnaire = await db.query.questionnairesTable.findFirst({
        where: eq(questionnairesTable.id, response.questionnaireId),
        with: {
          template: true,
        },
      });

      if (!doctorQuestionnaire || !doctorQuestionnaire.templateId) {
        return null;
      }

      const fields = await db.query.questionnaireTemplateFieldsTable.findMany({
        where: eq(
          questionnaireTemplateFieldsTable.templateId,
          doctorQuestionnaire.templateId,
        ),
        with: {
          field: true,
        },
        orderBy: (fields, { asc }) => [asc(fields.order)],
      });

      return {
        id: response.id,
        name: doctorQuestionnaire.name,
        templateName: doctorQuestionnaire.template?.name,
        responseData: response.responseData,
        fields: fields.map((f) => f.field),
        completedAt: response.completedAt,
      };
    }),
  );

  const validQuestionnaires = questionnairesWithDetails.filter(Boolean);

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Relatório do Atendimento</PageTitle>
            <PageDescription>
              {attendance.patient.name} - {attendance.doctor.specialty}
            </PageDescription>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <ReportContent
            attendance={attendance}
            vitalSigns={vitalSigns}
            physicalExam={physicalExam}
            prescription={prescription}
            certificate={certificate}
            questionnaires={validQuestionnaires}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
