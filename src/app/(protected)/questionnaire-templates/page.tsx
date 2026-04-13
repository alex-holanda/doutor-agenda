// src/app/(protected)/questionnaire-templates/page.tsx
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddTemplateButton from "./_components/add-template-button";
import { getQuestionnaireTemplates } from "@/actions/questionnaire-templates";
import { TemplatesGrid } from "./_components/templates-grid";

const QuestionnaireTemplatesPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user?.clinic) {
    redirect("/clinic-form");
  }

  const templates = await getQuestionnaireTemplates();

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Templates de Questionários</PageTitle>
            <PageDescription>
              Gerencie os modelos de questionários disponíveis
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddTemplateButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <TemplatesGrid templates={templates} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default QuestionnaireTemplatesPage;
