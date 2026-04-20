// src/app/(protected)/attendances/[attendanceId]/report/_components/report-content.tsx
"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Printer,
  FileText,
  Pill,
  Activity,
  ClipboardList,
  Heart,
  Stethoscope,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ReportContentProps {
  attendance: any;
  vitalSigns: any;
  physicalExam: any;
  prescription: any;
  certificate: any;
  questionnaires: any[];
}

export function ReportContent({
  attendance,
  vitalSigns,
  physicalExam,
  prescription,
  certificate,
  questionnaires,
}: ReportContentProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Botão de impressão */}
      <div className="flex justify-end print:hidden">
        <Button onClick={handlePrint} variant="outline">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir Relatório
        </Button>
      </div>

      {/* Cabeçalho */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">RELATÓRIO DE ATENDIMENTO</h1>
            <p className="text-muted-foreground mt-1">
              {format(new Date(attendance.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                locale: ptBR,
              })}
            </p>
          </div>
          <Separator className="my-4" />
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Paciente</p>
              <p className="font-medium">{attendance.patient.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Médico</p>
              <p className="font-medium">{attendance.doctor.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Especialidade</p>
              <p className="font-medium">{attendance.doctor.specialty}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tipo</p>
              <Badge variant="outline">
                {attendance.type === "scheduled" && "Agendado"}
                {attendance.type === "walk_in" && "Avulso"}
                {attendance.type === "emergency" && "Emergência"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="summary" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="summary">
            <FileText className="mr-2 h-4 w-4" />
            Resumo
          </TabsTrigger>
          <TabsTrigger value="vital-signs">
            <Heart className="mr-2 h-4 w-4" />
            Sinais Vitais
          </TabsTrigger>
          <TabsTrigger value="physical-exam">
            <Stethoscope className="mr-2 h-4 w-4" />
            Exame Físico
          </TabsTrigger>
          <TabsTrigger value="questionnaires">
            <ClipboardList className="mr-2 h-4 w-4" />
            Questionários
          </TabsTrigger>
          <TabsTrigger value="prescription">
            <Pill className="mr-2 h-4 w-4" />
            Prescrição
          </TabsTrigger>
        </TabsList>
        {/* Aba Resumo */}
        <TabsContent value="summary">
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Atendimento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-muted-foreground text-sm">
                  Queixa principal
                </p>
                <p className="font-medium">
                  {attendance.chiefComplaint || "Não informada"}
                </p>
              </div>
              {vitalSigns && (
                <div>
                  <p className="text-muted-foreground text-sm">Sinais Vitais</p>
                  <p className="text-sm">
                    PA: {vitalSigns.bloodPressureSystolic}/
                    {vitalSigns.bloodPressureDiastolic} mmHg | FC:{" "}
                    {vitalSigns.heartRate} bpm | Temp: {vitalSigns.temperature}
                    °C | Sat: {vitalSigns.oxygenSaturation}%
                  </p>
                </div>
              )}
              {prescription?.medications && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    Medicamentos Prescritos
                  </p>
                  <p className="text-sm">{prescription.medications}</p>
                </div>
              )}
              {certificate && certificate.days > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm">Atestado</p>
                  <p className="text-sm">
                    {certificate.days} dias de afastamento
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Aba Sinais Vitais */}
        <TabsContent value="vital-signs">
          <Card>
            <CardHeader>
              <CardTitle>Sinais Vitais</CardTitle>
            </CardHeader>
            <CardContent>
              {vitalSigns ? (
                <div className="space-y-6">
                  {/* Pressão Arterial */}
                  <div>
                    <h3 className="mb-3 font-semibold">Pressão Arterial</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Pressão Sistólica
                        </p>
                        <p className="font-medium">
                          {vitalSigns.bloodPressureSystolic || "-"} mmHg
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Pressão Diastólica
                        </p>
                        <p className="font-medium">
                          {vitalSigns.bloodPressureDiastolic || "-"} mmHg
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Frequências */}
                  <div>
                    <h3 className="mb-3 font-semibold">Frequências</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Frequência Cardíaca
                        </p>
                        <p className="font-medium">
                          {vitalSigns.heartRate || "-"} bpm
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Frequência Respiratória
                        </p>
                        <p className="font-medium">
                          {vitalSigns.respiratoryRate || "-"} rpm
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Outros Sinais */}
                  <div>
                    <h3 className="mb-3 font-semibold">Outros Sinais</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Temperatura
                        </p>
                        <p className="font-medium">
                          {vitalSigns.temperature || "-"} °C
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Saturação de Oxigênio
                        </p>
                        <p className="font-medium">
                          {vitalSigns.oxygenSaturation || "-"} %
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">
                          Glicemia
                        </p>
                        <p className="font-medium">
                          {vitalSigns.bloodGlucose || "-"} mg/dL
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Antropometria */}
                  <div>
                    <h3 className="mb-3 font-semibold">Antropometria</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-muted-foreground text-sm">Peso</p>
                        <p className="font-medium">
                          {vitalSigns.weight || "-"} kg
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">Altura</p>
                        <p className="font-medium">
                          {vitalSigns.height || "-"} cm
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm">IMC</p>
                        <p className="font-medium">
                          {vitalSigns.bmi || "-"} kg/m²
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Escala de Dor */}
                  <div>
                    <h3 className="mb-3 font-semibold">Avaliação da Dor</h3>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Escala de Dor
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-sm">0</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
                          <div
                            className="h-full rounded-full bg-red-500"
                            style={{
                              width: `${(vitalSigns.painScale || 0) * 10}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm">10</span>
                        <span className="ml-2 font-medium">
                          {vitalSigns.painScale || 0}/10
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Observações */}
                  {vitalSigns.notes && (
                    <div>
                      <h3 className="mb-2 font-semibold">Observações</h3>
                      <p className="text-sm whitespace-pre-wrap">
                        {vitalSigns.notes}
                      </p>
                    </div>
                  )}

                  {/* Metadados */}
                  <div className="text-muted-foreground border-t pt-4 text-xs">
                    <p>
                      Aferido por:{" "}
                      {vitalSigns.measuredBy === "doctor"
                        ? "Médico"
                        : "Enfermeiro"}
                    </p>
                    <p>
                      Data da medição:{" "}
                      {format(
                        new Date(vitalSigns.measuredAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Nenhum dado de sinais vitais registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Aba Exame Físico */}
        <TabsContent value="physical-exam">
          <Card>
            <CardHeader>
              <CardTitle>Exame Físico</CardTitle>
            </CardHeader>
            <CardContent>
              {physicalExam ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Estado Geral
                      </p>
                      <p className="font-medium">
                        {physicalExam.generalState || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Nível de Consciência
                      </p>
                      <p className="font-medium">
                        {physicalExam.consciousnessLevel || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Hidratação
                      </p>
                      <p className="font-medium">
                        {physicalExam.hydration || "Não informado"}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Coloração da Pele
                      </p>
                      <p className="font-medium">
                        {physicalExam.skinColor || "Não informado"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  {physicalExam.lungAuscultation && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Ausculta Pulmonar
                      </p>
                      <p className="text-sm">{physicalExam.lungAuscultation}</p>
                    </div>
                  )}
                  {physicalExam.heartAuscultation && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Ausculta Cardíaca
                      </p>
                      <p className="text-sm">
                        {physicalExam.heartAuscultation}
                      </p>
                    </div>
                  )}
                  {physicalExam.abdomen && (
                    <div>
                      <p className="text-muted-foreground text-sm">Abdome</p>
                      <p className="text-sm">{physicalExam.abdomen}</p>
                    </div>
                  )}
                  {physicalExam.extremities && (
                    <div>
                      <p className="text-muted-foreground text-sm">
                        Extremidades
                      </p>
                      <p className="text-sm">{physicalExam.extremities}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Nenhum dado de exame físico registrado
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Aba Questionários */}
        <TabsContent value="questionnaires">
          <Card>
            <CardHeader>
              <CardTitle>Questionários Respondidos</CardTitle>
            </CardHeader>
            <CardContent>
              {questionnaires.length > 0 ? (
                <div className="space-y-6">
                  {questionnaires.map((q, index) => (
                    <div key={q.id}>
                      {index > 0 && <Separator className="my-4" />}
                      <div>
                        <h3 className="mb-4 font-semibold">{q.name}</h3>
                        <div className="space-y-3">
                          {q.fields && q.fields.length > 0 ? (
                            q.fields.map((field: any) => {
                              const value = q.responseData?.[field.fieldKey];

                              // Pular campos sem valor (exceto false e 0)
                              if (
                                value === undefined ||
                                value === null ||
                                value === ""
                              )
                                return null;

                              let displayValue = value;

                              // Formatar o valor conforme o tipo
                              if (field.fieldType === "boolean") {
                                displayValue = value ? "Sim" : "Não";
                              } else if (
                                field.fieldType === "multi_select" &&
                                Array.isArray(value)
                              ) {
                                displayValue = value.join(", ");
                              } else if (field.fieldType === "date" && value) {
                                displayValue = format(
                                  new Date(value),
                                  "dd/MM/yyyy",
                                  { locale: ptBR },
                                );
                              } else if (
                                field.fieldType === "number" ||
                                field.fieldType === "scale"
                              ) {
                                displayValue = value.toString();
                              }

                              // Obter o label do campo
                              const fieldLabel =
                                field.label || field.name || field.fieldKey;

                              return (
                                <div
                                  key={field.id}
                                  className="grid grid-cols-3 gap-2 text-sm"
                                >
                                  <p className="text-muted-foreground">
                                    {fieldLabel}:
                                  </p>
                                  <p className="col-span-2 font-medium">
                                    {displayValue}
                                    {field.unit && ` ${field.unit}`}
                                  </p>
                                </div>
                              );
                            })
                          ) : (
                            <p className="text-muted-foreground text-sm">
                              Nenhum campo configurado para este questionário
                            </p>
                          )}

                          {/* Mostrar dados brutos se não houver campos estruturados */}
                          {(!q.fields || q.fields.length === 0) &&
                            q.responseData && (
                              <div className="mt-2">
                                <p className="text-muted-foreground text-sm">
                                  Dados:
                                </p>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center">
                  Nenhum questionário respondido
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        {/* Aba Prescrição */}
        <TabsContent value="prescription">
          <Card>
            <CardHeader>
              <CardTitle>Prescrição Médica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {prescription ? (
                <>
                  <div>
                    <h3 className="font-semibold">Medicamentos</h3>
                    <p className="mt-1 whitespace-pre-wrap">
                      {prescription.medications ||
                        "Nenhum medicamento prescrito"}
                    </p>
                  </div>
                  {prescription.exams && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold">Exames Solicitados</h3>
                        <p className="mt-1 whitespace-pre-wrap">
                          {prescription.exams}
                        </p>
                      </div>
                    </>
                  )}
                  {prescription.orientations && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold">Orientações</h3>
                        <p className="mt-1 whitespace-pre-wrap">
                          {prescription.orientations}
                        </p>
                      </div>
                    </>
                  )}
                  {prescription.returnDate && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-semibold">Data de Retorno</h3>
                        <p className="mt-1">
                          {format(
                            new Date(prescription.returnDate),
                            "dd/MM/yyyy",
                            { locale: ptBR },
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <p className="text-muted-foreground text-center">
                  Nenhuma prescrição registrada
                </p>
              )}

              {certificate && certificate.days > 0 && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold">Atestado Médico</h3>
                    <p className="mt-1">
                      {certificate.days} dias de afastamento
                    </p>
                    {certificate.cidCode && (
                      <p className="mt-1 text-sm">
                        CID: {certificate.cidCode} -{" "}
                        {certificate.cidDescription}
                      </p>
                    )}
                    {certificate.recommendation && (
                      <p className="mt-1 text-sm">
                        Recomendações: {certificate.recommendation}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
