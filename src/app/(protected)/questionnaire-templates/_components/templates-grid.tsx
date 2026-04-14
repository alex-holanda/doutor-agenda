// src/app/(protected)/questionnaire-templates/_components/templates-grid.tsx
"use client";

import { useState } from "react";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Search,
  MoreVertical,
  Copy,
  Eye,
  FileEdit,
  Trash2,
  Heart,
  FileText,
  Activity,
  Pill,
} from "lucide-react";
import { toast } from "sonner";
import {
  deleteQuestionnaireTemplate,
  duplicateQuestionnaireTemplate,
  updateQuestionnaireTemplate,
} from "@/actions/questionnaire-templates";
import { TemplatePreviewDialog } from "./template-preview-dialog";
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
import { Textarea } from "@/components/ui/textarea";

interface TemplatesGridProps {
  templates: any[];
}

const categoryLabels: Record<string, string> = {
  vital_signs: "Sinais Vitais",
  anamnesis: "Anamnese",
  physical_exam: "Exame Físico",
  prescription: "Prescrição",
  custom: "Personalizado",
};

const editFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  description: z.string().optional(),
});

export function TemplatesGrid({
  templates: initialTemplates,
}: TemplatesGridProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);

  const editForm = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateQuestionnaireTemplate(id);
      toast.success("Template duplicado com sucesso");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao duplicar template");
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error("Templates do sistema não podem ser excluídos");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este template?")) return;

    try {
      await deleteQuestionnaireTemplate(id);
      toast.success("Template excluído com sucesso");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir template");
    }
  };

  const handleEdit = (template: any) => {
    setEditingTemplate(template);
    editForm.reset({
      name: template.name,
      description: template.description || "",
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (data: z.infer<typeof editFormSchema>) => {
    if (!editingTemplate) return;

    try {
      await updateQuestionnaireTemplate(editingTemplate.id, {
        name: data.name,
        description: data.description,
      });
      toast.success("Template atualizado com sucesso");
      setIsEditing(false);
      setEditingTemplate(null);
      editForm.reset();
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar template");
    }
  };

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas categorias</SelectItem>
            <SelectItem value="vital_signs">Sinais Vitais</SelectItem>
            <SelectItem value="anamnesis">Anamnese</SelectItem>
            <SelectItem value="physical_exam">Exame Físico</SelectItem>
            <SelectItem value="prescription">Prescrição</SelectItem>
            <SelectItem value="custom">Personalizados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.length === 0 ? (
          <div className="text-muted-foreground col-span-full py-12 text-center">
            Nenhum template encontrado
          </div>
        ) : (
          filteredTemplates.map((template) => {
            return (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="bg-primary/10 rounded-lg p-2">
                      <FileText className="text-primary h-5 w-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger>
                        <Button variant="ghost" size="icon" type="button">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() => setPreviewTemplate(template)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() => handleDuplicate(template.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        {!template.isSystem && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onSelect={() => handleEdit(template)}
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleDelete(template.id, template.isSystem)
                              }
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="mt-2">{template.name}</CardTitle>
                  <CardDescription>
                    {template.description || "Sem descrição"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Campos: </span>
                      <span className="font-medium">
                        {template.fieldsCount}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Usos: </span>
                      <span className="font-medium">
                        {template.usageCount || 0}
                      </span>
                    </div>
                    <div>
                      <Badge
                        variant={template.isSystem ? "default" : "secondary"}
                      >
                        {template.isSystem ? "Sistema" : "Personalizado"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Preview Dialog */}
      <TemplatePreviewDialog
        open={!!previewTemplate}
        onOpenChange={() => setPreviewTemplate(null)}
        template={previewTemplate}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>Altere os dados do template</DialogDescription>
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
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
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
