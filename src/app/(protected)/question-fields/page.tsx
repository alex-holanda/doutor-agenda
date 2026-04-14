// src/app/(protected)/question-fields/page.tsx
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
import { db } from "@/db";
import { questionnaireFieldsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

import AddFieldButton from "./_components/add-field-button";
import { FieldsTable } from "./_components/fields-table";

const QuestionFieldsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Buscar campos ativos
  const fields = await db.query.questionnaireFieldsTable.findMany({
    where: eq(questionnaireFieldsTable.isActive, true),
    orderBy: (fields, { asc }) => [asc(fields.order)],
  });

  return (
    <WithAuthentication mustHaveClinic mustHavePlan>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>Catálogo de Campos</PageTitle>
            <PageDescription>
              Gerencie os campos disponíveis para criação de questionários
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <AddFieldButton />
          </PageActions>
        </PageHeader>
        <PageContent>
          <FieldsTable fields={fields} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default QuestionFieldsPage;
