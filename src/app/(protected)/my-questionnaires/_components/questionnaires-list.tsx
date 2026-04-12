// src/app/(protected)/my-questionnaires/_components/questionnaires-list.tsx
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  FileEdit,
  Trash2,
  Play,
  User,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { deleteQuestionnaire } from "@/actions/my-questionnaires";

interface QuestionnairesListProps {
  questionnaires: any[];
  doctors: any[];
  search?: string;
  doctorId?: string;
}

export function QuestionnairesList({
  questionnaires,
  doctors,
  search: initialSearch,
  doctorId: initialDoctorId,
}: QuestionnairesListProps) {
  const router = useRouter();
  const [search, setSearch] = useState(initialSearch || "");
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    initialDoctorId || "all",
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedDoctorId && selectedDoctorId !== "all")
      params.set("doctorId", selectedDoctorId);
    router.push(`/my-questionnaires?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este questionário?")) return;

    try {
      await deleteQuestionnaire(id);
      toast.success("Questionário excluído com sucesso");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir questionário");
    }
  };

  const handleUse = (questionnaireId: string) => {
    toast.info("Em desenvolvimento - Integração com atendimentos");
  };

  if (questionnaires.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">
          {search || (selectedDoctorId && selectedDoctorId !== "all")
            ? "Nenhum questionário encontrado"
            : "Nenhum questionário cadastrado"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar por nome do questionário ou médico..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyPress={handleKeyPress}
            className="pl-9"
          />
        </div>
        <Select value={selectedDoctorId} onValueChange={setSelectedDoctorId}>
          <SelectTrigger className="w-[250px]">
            <SelectValue placeholder="Filtrar por médico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os médicos</SelectItem>
            {doctors.map((doctor) => (
              <SelectItem key={doctor.id} value={doctor.id}>
                Dr(a). {doctor.name} - {doctor.specialty}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleSearch} variant="secondary">
          Filtrar
        </Button>
      </div>

      {/* Lista de Questionários */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {questionnaires.map((questionnaire) => (
          <Card key={questionnaire.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <Badge variant="outline">
                  {questionnaire.template?.category || "Personalizado"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/my-questionnaires/${questionnaire.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleUse(questionnaire.id)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Usar no Atendimento
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(questionnaire.id)}
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
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <User className="h-3 w-3" />
                    Médico:
                  </span>
                  <span className="font-medium">
                    Dr(a). {questionnaire.doctor?.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <FileText className="h-3 w-3" />
                    Campos:
                  </span>
                  <span className="font-medium">
                    {questionnaire.template?.fieldsCount || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Criado em:</span>
                  <span className="text-sm">
                    {format(new Date(questionnaire.createdAt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleUse(questionnaire.id)}
              >
                <Play className="mr-2 h-4 w-4" />
                Usar
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  router.push(`/my-questionnaires/${questionnaire.id}`)
                }
              >
                <Eye className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
