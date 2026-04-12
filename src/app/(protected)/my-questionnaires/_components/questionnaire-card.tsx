// src/app/(protected)/my-questionnaires/_components/questionnaire-card.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  FileEdit,
  Trash2,
  Eye,
  Play,
  Calendar,
  Copy,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

import { QuestionnaireDetailDialog } from "./questionnaire-detail-dialog";
import { deleteQuestionnaire } from "@/actions/my-questionnaires";
import { EditQuestionnaireDialog } from "./edit-questionnaire-dialog";

interface QuestionnaireCardProps {
  questionnaire: any;
}

const categoryLabels: Record<string, string> = {
  vital_signs: "Sinais Vitais",
  anamnesis: "Anamnese",
  physical_exam: "Exame Físico",
  prescription: "Prescrição",
  custom: "Personalizado",
};

export function QuestionnaireCard({ questionnaire }: QuestionnaireCardProps) {
  const router = useRouter();
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja excluir este questionário?")) return;

    try {
      await deleteQuestionnaire(questionnaire.id);
      toast.success("Questionário excluído com sucesso");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir questionário");
    }
  };

  const handleUse = () => {
    // Redirecionar para um atendimento com este questionário
    // Por enquanto, apenas um alerta
    toast.info("Em desenvolvimento - Integração com atendimentos");
  };

  return (
    <>
      <Card className="relative transition-shadow hover:shadow-md">
        <CardHeader>
          <div className="flex items-start justify-between">
            <Badge variant="outline">
              {categoryLabels[questionnaire.template?.category] ||
                "Personalizado"}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                  <FileEdit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUse}>
                  <Play className="mr-2 h-4 w-4" />
                  Usar no Atendimento
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="mt-2 line-clamp-1">
            {questionnaire.name}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            Baseado em: {questionnaire.template?.name}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Campos:</span>
              <span className="font-medium">
                {questionnaire.template?.fields?.length || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Usos:</span>
              <span className="font-medium">
                {questionnaire.usageCount || 0}
              </span>
            </div>
            {questionnaire.lastUsed && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Último uso:</span>
                <span className="text-sm">
                  {format(new Date(questionnaire.lastUsed), "dd/MM/yyyy", {
                    locale: ptBR,
                  })}
                </span>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsDetailOpen(true)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Visualizar
          </Button>
          <Button className="flex-1" onClick={handleUse}>
            <Play className="mr-2 h-4 w-4" />
            Usar
          </Button>
        </CardFooter>
      </Card>

      {/* Detail Dialog */}
      <QuestionnaireDetailDialog
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        questionnaire={questionnaire}
      />

      {/* Edit Dialog */}
      <EditQuestionnaireDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        questionnaire={questionnaire}
      />
    </>
  );
}
