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
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuestionnaireById } from "@/actions/my-questionnaires";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

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

  const fields = (questionnaire.template?.fields || [])
    .map((f: any, index: number) => ({
      id: f.id,
      name: f.name || f.fieldKey,
      description: f.description,
      fieldKey: f.fieldKey,
      fieldType: f.fieldType,
      unit: f.unit,
      order: f.order ?? index,
    }))
    .sort((a: any, b: any) => a.order - b.order);

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <div className="flex items-center gap-2">
              <div>
                <PageTitle>{questionnaire.name}</PageTitle>
                <PageDescription>
                  Dr(a). {questionnaire.doctor?.name}
                </PageDescription>
              </div>
            </div>
          </PageHeaderContent>
        </PageHeader>

        <PageContent>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Campos do Questionário</h3>
            <div className="space-y-2">
              {fields.map((field: any, index: number) => (
                <Card key={field.id}>
                  <CardContent>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <p className="font-medium">{field.name}</p>
                          <p className="text-muted-foreground text-xs">
                            {field.fieldKey} • {field.fieldType}
                            {field.unit && ` • ${field.unit}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
}
