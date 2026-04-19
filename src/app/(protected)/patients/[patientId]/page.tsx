import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Phone,
  Mail,
  CalendarDays,
} from "lucide-react";

import { auth } from "@/lib/auth";
import WithAuthentication from "@/hocs/with-authentication";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import {
  patientsTable,
  attendancesTable,
  professionalsTable,
} from "@/db/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

import { PatientKPI } from "./_components/patient-kpi";

interface PatientPageProps {
  params: Promise<{
    patientId: string;
  }>;
}

export default async function PatientPage({ params }: PatientPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const { patientId } = await params;

  const patient = await db.query.patientsTable.findFirst({
    where: eq(patientsTable.id, patientId),
  });

  if (!patient) {
    notFound();
  }

  const attendances = await db.query.attendancesTable.findMany({
    where: and(
      eq(attendancesTable.patientId, patientId),
      eq(attendancesTable.clinicId, session!.user.clinic!.id),
    ),
    with: {
      doctor: true,
    },
    orderBy: (attendances, { desc }) => [desc(attendancesTable.createdAt)],
  });

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <div>
                <PageTitle>{patient.name}</PageTitle>
                <PageDescription>Detalhes do paciente</PageDescription>
              </div>
            </div>
          </PageHeaderContent>
        </PageHeader>

        <PageContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Informações do Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Informações Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Phone className="text-muted-foreground h-4 w-4" />
                  <span>{patient.phoneNumber || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="text-muted-foreground h-4 w-4" />
                  <span>{patient.email || "Não informado"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="text-muted-foreground h-4 w-4" />
                  <span>
                    {patient.birthDate
                      ? format(new Date(patient.birthDate), "PPP", {
                          locale: ptBR,
                        })
                      : "Não informada"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">Sexo:</span>
                  <span>
                    {patient.sex === "male" ? "Masculino" : "Feminino"}
                  </span>
                </div>
                {patient.cpf && (
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">CPF:</span>
                    <span>{patient.cpf}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* KPIs do Paciente */}
            <Card className="md:col-span-2">
              <PatientKPI patientId={patientId} />
            </Card>

            {/*Evolução do Paciente */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Histórico de Atendimentos ({attendances.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attendances.length === 0 ? (
                  <p className="text-muted-foreground py-4 text-center">
                    Nenhum atendimento encontrado
                  </p>
                ) : (
                  <div className="space-y-3">
                    {attendances.map((attendance) => (
                      <div
                        key={attendance.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="text-muted-foreground h-4 w-4" />
                          <div>
                            <p className="font-medium">
                              {attendance.doctor.name}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              {format(new Date(attendance.createdAt), "PPPp", {
                                locale: ptBR,
                              })}
                            </p>
                            {attendance.chiefComplaint && (
                              <p className="text-muted-foreground text-sm">
                                {attendance.chiefComplaint}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              attendance.status === "completed"
                                ? "default"
                                : attendance.status === "cancelled"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {attendance.status === "completed"
                              ? "Concluído"
                              : attendance.status === "cancelled"
                                ? "Cancelado"
                                : attendance.status === "in_progress"
                                  ? "Em andamento"
                                  : "Aguardando"}
                          </Badge>
                          {attendance.status === "completed" && (
                            <Link href={`/attendances/${attendance.id}/report`}>
                              <Button variant="outline" size="sm">
                                Ver relatório
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
