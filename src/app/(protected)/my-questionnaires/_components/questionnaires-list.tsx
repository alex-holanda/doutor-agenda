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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  FileEdit,
  FileText,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  deleteQuestionnaire,
  updateQuestionnaire,
} from "@/actions/my-questionnaires";

interface QuestionnairesListProps {
  questionnaires: any[];
  doctors: any[];
  search?: string;
  doctorId?: string;
}

const editFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
});

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
  const [editingQuestionnaire, setEditingQuestionnaire] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const editForm = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
    },
  });

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

  const handleEdit = (questionnaire: any) => {
    setEditingQuestionnaire(questionnaire);
    editForm.reset({
      name: questionnaire.name,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (data: z.infer<typeof editFormSchema>) => {
    if (!editingQuestionnaire) return;

    try {
      await updateQuestionnaire(editingQuestionnaire.id, {
        name: data.name,
      });
      toast.success("Questionário atualizado com sucesso");
      setIsEditing(false);
      setEditingQuestionnaire(null);
      editForm.reset();
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar questionário");
    }
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
            placeholder="Buscar por nome do questionário..."
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
                <div className="bg-primary/10 rounded-lg p-2">
                  <FileText className="text-primary h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" type="button">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={() =>
                        router.push(`/my-questionnaires/${questionnaire.id}`)
                      }
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Visualizar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => handleEdit(questionnaire)}
                    >
                      <FileEdit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => handleDelete(questionnaire.id)}
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
            <CardFooter>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(`/my-questionnaires/${questionnaire.id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Questionário</DialogTitle>
            <DialogDescription>Altere o nome do questionário</DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleSaveEdit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
