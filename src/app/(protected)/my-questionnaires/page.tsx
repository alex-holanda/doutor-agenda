// src/app/(protected)/my-questionnaires/page.tsx
import { headers } from "next/headers";

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
import {
  getDoctorsForSelect,
  getMyQuestionnaires,
  getTemplatesForSelect,
} from "@/actions/my-questionnaires";
import AddQuestionnaireButton from "./_components/add-questionnaire-button";
import { QuestionnairesList } from "./_components/questionnaires-list";

interface PageProps {
  searchParams: Promise<{
    search?: string;
    doctorId?: string;
  }>;
}

const MyQuestionnairesPage = async ({ searchParams }: PageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { search, doctorId } = await searchParams;

  const questionnaires = await getMyQuestionnaires(search, doctorId);
  const doctors = await getDoctorsForSelect();
  const templates = await getTemplatesForSelect();

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Meus Questionários</PageTitle>
            <PageDescription>
              Gerencie os questionários personalizados dos médicos
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddQuestionnaireButton doctors={doctors} templates={templates} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <QuestionnairesList
            questionnaires={questionnaires}
            doctors={doctors}
            search={search}
            doctorId={doctorId}
          />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default MyQuestionnairesPage;
