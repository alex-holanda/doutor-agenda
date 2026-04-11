// app/attendances/[attendanceId]/_components/questionnaires-section.tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Heart,
  Activity,
  ClipboardList,
  Loader2,
} from "lucide-react";

import { getQuestionnaires } from "@/actions/get-questionnaires";
import { getQuestionnaireResponses } from "@/actions/get-questionnaire-responses";
import { QuestionnaireForm } from "./questionnaire-form";

interface Field {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired?: boolean | null;
  options?: string[] | null;
  minValue?: number | null;
  maxValue?: number | null;
  order?: number | null;
}

interface Questionnaire {
  id: string;
  name: string;
  category: string | null;
  fields: Field[];
}

interface QuestionnairesSectionProps {
  attendanceId: string;
  isCompleted: boolean;
}

const iconMap: Record<string, any> = {
  anamnesis: FileText,
  vital_signs: Heart,
  physical_exam: Activity,
  prescription: ClipboardList,
};

export function QuestionnairesSection({
  attendanceId,
  isCompleted,
}: QuestionnairesSectionProps) {
  const [activeTab, setActiveTab] = useState("");

  const { data: questionnairesData, isLoading: isLoadingQuestionnaires } =
    useQuery({
      queryKey: ["questionnaires"],
      queryFn: () => getQuestionnaires(),
    });

  const {
    data: responsesData,
    isLoading: isLoadingResponses,
    refetch: refetchResponses,
  } = useQuery({
    queryKey: ["questionnaire-responses", attendanceId],
    queryFn: () => getQuestionnaireResponses({ attendanceId }),
  });

  const questionnaires =
    (questionnairesData?.data?.questionnairesWithFields as Questionnaire[]) ||
    [];
  const responses = (responsesData?.data as any[]) || [];

  if (isLoadingQuestionnaires || isLoadingResponses) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (questionnaires.length === 0) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <p>Nenhum questionário cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  if (activeTab === "" && questionnaires[0]) {
    setActiveTab(questionnaires[0].id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionários e Avaliações</CardTitle>
        {isCompleted && (
          <p className="text-muted-foreground text-sm">
            Atendimento finalizado - apenas visualização
          </p>
        )}
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            {questionnaires.map((q) => {
              const Icon = iconMap[q.category || ""] || FileText;
              return (
                <TabsTrigger key={q.id} value={q.id}>
                  <Icon className="mr-2 h-4 w-4" />
                  {q.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {questionnaires.map((q) => {
            const existingResponse = responses.find(
              (r) => r.questionnaireId === q.id,
            );

            return (
              <TabsContent key={q.id} value={q.id}>
                <QuestionnaireForm
                  questionnaireId={q.id}
                  attendanceId={attendanceId}
                  initialData={existingResponse?.responseData}
                  isCompleted={isCompleted}
                  onSuccess={() => refetchResponses()}
                />
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
