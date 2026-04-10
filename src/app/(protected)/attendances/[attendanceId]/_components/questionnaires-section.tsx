"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Heart,
  Activity,
  ClipboardList,
  Loader2,
  Save,
} from "lucide-react";
import { toast } from "sonner";

import { getQuestionnaires } from "@/actions/get-questionnaires";
import { getQuestionnaireResponses } from "@/actions/get-questionnaire-responses";
import { saveQuestionnaireResponse } from "@/actions/save-questionnaire-response";

interface QuestionnairesSectionProps {
  attendanceId: string;
  isCompleted: boolean;
}

const iconMap = {
  anamnesis: FileText,
  vital_signs: Heart,
  physical_exam: Activity,
  prescription: ClipboardList,
};

export function QuestionnairesSection({
  attendanceId,
  isCompleted,
}: QuestionnairesSectionProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("");
  const [formData, setFormData] = useState<Record<string, any>>({});

  const { data: questionnairesData, isLoading: isLoadingQuestionnaires } =
    useQuery({
      queryKey: ["questionnaires"],
      queryFn: () => getQuestionnaires(),
    });

  const { data: responsesData, isLoading: isLoadingResponses } = useQuery({
    queryKey: ["questionnaire-responses", attendanceId],
    queryFn: () => getQuestionnaireResponses({ attendanceId }),
  });

  const questionnaires = (questionnairesData?.data as any) || [];
  const responses = (responsesData?.data as any) || [];

  useEffect(() => {
    if (responses && responses.length > 0) {
      const loadedData: Record<string, any> = {};
      responses.forEach((response: any) => {
        loadedData[response.questionnaireId] = response.responseData;
      });
      setFormData(loadedData);
    }
  }, [responses]);

  const saveMutation = useMutation({
    mutationFn: async ({
      questionnaireId,
      data,
    }: {
      questionnaireId: string;
      data: any;
    }) => {
      const result = await saveQuestionnaireResponse({
        attendanceId,
        questionnaireId,
        responseData: data,
      });
      if (!result?.success) {
        throw new Error("Erro ao salvar");
      }
      return result;
    },
    onSuccess: () => {
      toast.success("Questionário salvo com sucesso");
      queryClient.invalidateQueries({
        queryKey: ["questionnaire-responses", attendanceId],
      });
    },
    onError: () => {
      toast.error("Erro ao salvar questionário");
    },
  });

  const handleFieldChange = (
    questionnaireId: string,
    fieldKey: string,
    value: any,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [questionnaireId]: {
        ...(prev[questionnaireId] || {}),
        [fieldKey]: value,
      },
    }));
  };

  const handleSave = (questionnaireId: string) => {
    const data = formData[questionnaireId] || {};
    saveMutation.mutate({ questionnaireId, data });
  };

  if (isLoadingQuestionnaires || isLoadingResponses) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (
    !questionnaires.questionnairesWithFields ||
    questionnaires.questionnairesWithFields.length === 0
  ) {
    return (
      <Card>
        <CardContent className="flex min-h-[400px] items-center justify-center">
          <p>Nenhum questionário cadastrado</p>
        </CardContent>
      </Card>
    );
  }

  if (activeTab === "" && questionnaires.questionnairesWithFields[0]) {
    setActiveTab(questionnaires.questionnairesWithFields[0].id);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionários e Avaliações</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-4">
            {questionnaires.questionnairesWithFields.map((q: any) => {
              const Icon =
                iconMap[q.category as keyof typeof iconMap] || FileText;
              return (
                <TabsTrigger key={q.id} value={q.id} disabled={isCompleted}>
                  <Icon className="mr-2 h-4 w-4" />
                  {q.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {questionnaires.questionnairesWithFields.map((q: any) => {
            const currentData = formData[q.id] || {};

            return (
              <TabsContent key={q.id} value={q.id}>
                <div className="space-y-4">
                  {q.fields?.map((field: any) => {
                    const value = currentData[field.fieldKey] || "";

                    return (
                      <div key={field.id} className="rounded-lg border p-4">
                        <label className="font-medium">
                          {field.label}
                          {field.isRequired && (
                            <span className="ml-1 text-red-500">*</span>
                          )}
                        </label>
                        <div className="mt-2">
                          {field.fieldType === "textarea" && (
                            <textarea
                              className="w-full rounded-md border p-2"
                              rows={4}
                              placeholder={field.placeholder || ""}
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                          {field.fieldType === "text" && (
                            <input
                              type="text"
                              className="w-full rounded-md border p-2"
                              placeholder={field.placeholder || ""}
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                          {field.fieldType === "number" && (
                            <input
                              type="number"
                              className="w-full rounded-md border p-2"
                              placeholder={field.placeholder || ""}
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          )}
                          {field.fieldType === "select" && field.options && (
                            <select
                              className="w-full rounded-md border p-2"
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  e.target.value,
                                )
                              }
                            >
                              <option value="">Selecione...</option>
                              {field.options.map((opt: string) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          )}
                          {field.fieldType === "multi_select" &&
                            field.options && (
                              <div className="space-y-2">
                                {field.options.map((opt: string) => (
                                  <div
                                    key={opt}
                                    className="flex items-center gap-2"
                                  >
                                    <input
                                      type="checkbox"
                                      id={`${field.id}-${opt}`}
                                      disabled={isCompleted}
                                      checked={
                                        Array.isArray(value) &&
                                        value.includes(opt)
                                      }
                                      onChange={(e) => {
                                        let newValue = Array.isArray(value)
                                          ? [...value]
                                          : [];
                                        if (e.target.checked) {
                                          newValue.push(opt);
                                        } else {
                                          newValue = newValue.filter(
                                            (v: string) => v !== opt,
                                          );
                                        }
                                        handleFieldChange(
                                          q.id,
                                          field.fieldKey,
                                          newValue,
                                        );
                                      }}
                                    />
                                    <label htmlFor={`${field.id}-${opt}`}>
                                      {opt}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          {field.fieldType === "radio" && field.options && (
                            <div className="space-y-2">
                              {field.options.map((opt: string) => (
                                <div
                                  key={opt}
                                  className="flex items-center gap-2"
                                >
                                  <input
                                    type="radio"
                                    id={`${field.id}-${opt}`}
                                    name={field.fieldKey}
                                    disabled={isCompleted}
                                    checked={value === opt}
                                    onChange={() =>
                                      handleFieldChange(
                                        q.id,
                                        field.fieldKey,
                                        opt,
                                      )
                                    }
                                  />
                                  <label htmlFor={`${field.id}-${opt}`}>
                                    {opt}
                                  </label>
                                </div>
                              ))}
                            </div>
                          )}
                          {field.fieldType === "boolean" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                id={field.id}
                                disabled={isCompleted}
                                checked={value === true}
                                onChange={(e) =>
                                  handleFieldChange(
                                    q.id,
                                    field.fieldKey,
                                    e.target.checked,
                                  )
                                }
                              />
                              <label htmlFor={field.id}>Sim</label>
                            </div>
                          )}
                          {field.fieldType === "date" && (
                            <input
                              type="date"
                              className="w-full rounded-md border p-2"
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                          {field.fieldType === "time" && (
                            <input
                              type="time"
                              className="w-full rounded-md border p-2"
                              disabled={isCompleted}
                              value={value}
                              onChange={(e) =>
                                handleFieldChange(
                                  q.id,
                                  field.fieldKey,
                                  e.target.value,
                                )
                              }
                            />
                          )}
                          {field.fieldType === "scale" && (
                            <div className="space-y-2">
                              <input
                                type="range"
                                min={field.minValue || 0}
                                max={field.maxValue || 10}
                                step={1}
                                className="w-full"
                                disabled={isCompleted}
                                value={value || 0}
                                onChange={(e) =>
                                  handleFieldChange(
                                    q.id,
                                    field.fieldKey,
                                    parseInt(e.target.value),
                                  )
                                }
                              />
                              <div className="flex justify-between text-sm">
                                <span>{field.minValue || 0}</span>
                                <span className="font-bold">{value || 0}</span>
                                <span>{field.maxValue || 10}</span>
                              </div>
                            </div>
                          )}
                        </div>
                        {field.helpText && (
                          <p className="text-muted-foreground mt-1 text-sm">
                            {field.helpText}
                          </p>
                        )}
                      </div>
                    );
                  })}

                  {!isCompleted && (
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={() => handleSave(q.id)}
                        disabled={saveMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        {saveMutation.isPending
                          ? "Salvando..."
                          : "Salvar questionário"}
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </CardContent>
    </Card>
  );
}
