// src/app/(protected)/my-questionnaires/[questionnaireId]/page.tsx
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import WithAuthentication from "@/hocs/with-authentication";
import {
  PageContainer,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getQuestionnaireById } from "@/actions/my-questionnaires";
import { FieldsReorderList } from "./_components/fields-reorder-list";

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
      order: f.order ?? index,
    }))
    .sort((a: any, b: any) => a.order - b.order);

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
                  Dr(a). {questionnaire.doctor?.name}
                </PageDescription>
              </div>
            </div>
          </PageHeaderContent>
        </PageHeader>

        <FieldsReorderList questionnaireId={questionnaireId} fields={fields} />
      </PageContainer>
    </WithAuthentication>
  );
}
