// app/(protected)/attendances/[attendanceId]/page.tsx
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";

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
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db";
import { attendancesTable } from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { QuestionnairesSection } from "./_components/questionnaires-section";
import { StartAttendanceButton } from "./_components/start-attendance-button";
import { CompleteAttendanceButton } from "./_components/complete-attendance-button";

interface AttendancePageProps {
  params: Promise<{
    attendanceId: string;
  }>;
}

export default async function AttendancePage({ params }: AttendancePageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { attendanceId } = await params;

  const attendance = await db.query.attendancesTable.findFirst({
    where: and(
      eq(attendancesTable.id, attendanceId),
      eq(attendancesTable.clinicId, session.user.clinic?.id!),
    ),
    with: {
      doctor: {
        columns: {
          id: true,
          name: true,
          specialty: true,
          avatarImageUrl: true,
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
  const isCompleted = attendance.status === "completed";
  const isInProgress = attendance.status === "in_progress";
  const isWaiting = attendance.status === "waiting";
  const showQuestionnaires = isInProgress || isCompleted;

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Atendimento</PageTitle>
            <PageDescription>Detalhes do atendimento</PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Badge variant={type.variant}>{type.label}</Badge>
            <Badge variant="outline">
              {isWaiting && "Aguardando"}
              {isInProgress && "Em andamento"}
              {isCompleted && "Concluído"}
            </Badge>
          </PageActions>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Paciente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Nome</p>
                    <p className="font-medium">{attendance.patient.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Email</p>
                    <p className="font-medium">{attendance.patient.email}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Telefone</p>
                    <p className="font-medium">
                      {attendance.patient.phoneNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">Sexo</p>
                    <p className="font-medium">
                      {attendance.patient.sex === "male"
                        ? "Masculino"
                        : "Feminino"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dados do Médico</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted-foreground text-sm">Nome</p>
                    <p className="font-medium">{attendance.doctor.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Especialidade
                    </p>
                    <p className="font-medium">{attendance.doctor.specialty}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informações do Atendimento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {attendance.appointment && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Data agendada
                      </p>
                      <p className="font-medium">
                        {format(
                          new Date(attendance.appointment.date),
                          "dd/MM/yyyy 'às' HH:mm",
                          {
                            locale: ptBR,
                          },
                        )}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Início do atendimento
                    </p>
                    <p className="font-medium">
                      {attendance.actualStartTime
                        ? format(
                            new Date(attendance.actualStartTime),
                            "dd/MM/yyyy 'às' HH:mm",
                            {
                              locale: ptBR,
                            },
                          )
                        : "Não iniciado"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">
                      Término do atendimento
                    </p>
                    <p className="font-medium">
                      {attendance.actualEndTime
                        ? format(
                            new Date(attendance.actualEndTime),
                            "dd/MM/yyyy 'às' HH:mm",
                            {
                              locale: ptBR,
                            },
                          )
                        : "Não finalizado"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm">
                      Queixa principal
                    </p>
                    <p className="font-medium">
                      {attendance.chiefComplaint || "Não informada"}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-muted-foreground text-sm">Observações</p>
                    <p className="font-medium">
                      {attendance.notes || "Nenhuma observação"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {showQuestionnaires && (
              <QuestionnairesSection
                attendanceId={attendance.id}
                isCompleted={isCompleted}
              />
            )}

            <div className="flex justify-end gap-4">
              {isWaiting && (
                <StartAttendanceButton attendanceId={attendance.id} />
              )}
              {isInProgress && (
                <CompleteAttendanceButton attendanceId={attendance.id} />
              )}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
