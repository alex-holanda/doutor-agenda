// src/app/(protected)/my-questionnaires/[questionnaireId]/page.tsx
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getQuestionnaireById } from "@/actions/my-questionnaires";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface PageProps {
  params: Promise<{
    questionnaireId: string;
  }>;
}

export default async function QuestionnaireDetailPage({ params }: PageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const { questionnaireId } = await params;

  const questionnaire = await getQuestionnaireById(questionnaireId);

  if (!questionnaire) {
    notFound();
  }

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <Link href="/my-questionnaires">
                <Button variant="ghost" size="icon">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div>
                <PageTitle>{questionnaire.name}</PageTitle>
                <PageDescription>
                  Questionário de {questionnaire.doctor?.name}
                </PageDescription>
              </div>
            </div>
          </PageHeaderContent>
        </PageHeader>
        <PageContent>
          <div className="space-y-6">
            {/* Informações */}
            <Card>
              <CardHeader>
                <CardTitle>Informações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label className="text-muted-foreground">Médico</Label>
                    <p className="font-medium">
                      Dr(a). {questionnaire.doctor?.name}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Template</Label>
                    <p className="font-medium">
                      {questionnaire.template?.name || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">
                      Quantidade de Campos
                    </Label>
                    <p className="font-medium">
                      {questionnaire.template?.fields?.length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campos */}
            <Card>
              <CardHeader>
                <CardTitle>Campos do Questionário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {questionnaire.template?.fields &&
                questionnaire.template.fields.length > 0 ? (
                  questionnaire.template.fields.map(
                    (field: any, index: number) => (
                      <div key={field.id || index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Label>
                            {field.label || field.name || field.fieldKey}
                            {field.isRequired && (
                              <span className="ml-1 text-red-500">*</span>
                            )}
                          </Label>
                          <Badge variant="secondary" className="text-xs">
                            {field.fieldType}
                          </Badge>
                        </div>
                        {field.fieldType === "textarea" ? (
                          <Textarea
                            disabled
                            placeholder={
                              field.placeholder || "Campo de texto longo"
                            }
                            rows={3}
                          />
                        ) : field.fieldType === "select" ||
                          field.fieldType === "radio" ? (
                          <Textarea
                            disabled
                            placeholder={
                              field.options?.join(", ") ||
                              "Opções: " + (field.options?.length || 0)
                            }
                            rows={2}
                          />
                        ) : field.fieldType === "boolean" ? (
                          <Input disabled placeholder="Sim / Não" />
                        ) : field.fieldType === "number" ||
                          field.fieldType === "scale" ? (
                          <Input
                            disabled
                            type="number"
                            placeholder={field.placeholder || "Campo numérico"}
                          />
                        ) : (
                          <Input
                            disabled
                            placeholder={field.placeholder || "Campo de texto"}
                          />
                        )}
                        {field.helpText && (
                          <p className="text-muted-foreground text-xs">
                            {field.helpText}
                          </p>
                        )}
                      </div>
                    ),
                  )
                ) : (
                  <p className="text-muted-foreground py-4 text-center">
                    Nenhum campo encontrado neste questionário
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
