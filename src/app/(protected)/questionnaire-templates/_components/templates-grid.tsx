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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getQuestionFields } from "@/actions/question-fields";
import { useQuery } from "@tanstack/react-query";

interface TemplatesGridProps {
  templates: any[];
}

const editFormSchema = z
  .object({
    name: z.string().min(1, "Nome é obrigatório"),
    description: z.string().optional(),
    fieldIds: z.array(z.string()),
  })
  .refine((data) => data.fieldIds.length > 0, {
    message: "Selecione pelo menos um campo",
    path: ["fieldIds"],
  });

export function TemplatesGrid({
  templates: initialTemplates,
}: TemplatesGridProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [fieldsFilter, setFieldsFilter] = useState("");

  const { data: allFields = [] } = useQuery({
    queryKey: ["question-fields"],
    queryFn: () => getQuestionFields(),
  });

  const editForm = useForm({
    resolver: zodResolver(editFormSchema),
    defaultValues: {
      name: "",
      description: "",
      fieldIds: [],
    },
  });

  const selectedFieldIds = editForm.watch("fieldIds");

  const filteredFields = allFields.filter(
    (field: any) =>
      field.name.toLowerCase().includes(fieldsFilter.toLowerCase()) ||
      field.fieldKey.toLowerCase().includes(fieldsFilter.toLowerCase()),
  );

  const handleFieldToggle = (fieldId: string) => {
    const current = editForm.getValues("fieldIds");
    if (current.includes(fieldId)) {
      editForm.setValue(
        "fieldIds",
        current.filter((id: string) => id !== fieldId),
      );
    } else {
      editForm.setValue("fieldIds", [...current, fieldId]);
    }
  };

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

  const handleDelete = async (
    id: string,
    isSystem: boolean,
    usageCount: number,
  ) => {
    if (isSystem) {
      toast.error("Templates do sistema não podem ser excluídos");
      return;
    }

    if (usageCount > 0) {
      toast.error("Template em uso não pode ser excluído");
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
    if (template.usageCount > 0) {
      toast.error("Template em uso não pode ser editado");
      return;
    }
    setEditingTemplate(template);
    editForm.reset({
      name: template.name,
      description: template.description || "",
      fieldIds: template.fields?.map((f: any) => f.id) || [],
    });
    setIsEditing(true);
  };

  const handleSaveEdit = async (data: z.infer<typeof editFormSchema>) => {
    if (!editingTemplate) return;

    try {
      await updateQuestionnaireTemplate(editingTemplate.id, {
        name: data.name,
        description: data.description,
        fieldIds: data.fieldIds,
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
                      <DropdownMenuTrigger asChild>
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
                              disabled={template.usageCount > 0}
                            >
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar{" "}
                              {!template.isSystem &&
                                template.usageCount > 0 &&
                                "(em uso)"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() =>
                                handleDelete(
                                  template.id,
                                  template.isSystem,
                                  template.usageCount,
                                )
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
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Template</DialogTitle>
            <DialogDescription>
              Altere os dados e os campos do template
            </DialogDescription>
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

              <div className="space-y-2">
                <FormLabel>Campos do Questionário</FormLabel>
                <div className="relative">
                  <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                  <Input
                    placeholder="Buscar campos..."
                    value={fieldsFilter}
                    onChange={(e) => setFieldsFilter(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="max-h-[250px] overflow-y-auto rounded-lg border p-4">
                  {filteredFields.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      Nenhum campo encontrado
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {filteredFields.map((field: any) => (
                        <div
                          key={field.id}
                          className="hover:bg-muted flex items-center justify-between rounded-lg p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={selectedFieldIds.includes(field.id)}
                              onCheckedChange={() =>
                                handleFieldToggle(field.id)
                              }
                            />
                            <div>
                              <p className="font-medium">{field.name}</p>
                              <p className="text-muted-foreground text-xs">
                                {field.fieldKey} • {field.fieldType}
                                {field.unit && ` • ${field.unit}`}
                              </p>
                            </div>
                          </div>
                          {field.isRequired && (
                            <Badge variant="outline" className="text-xs">
                              Obrigatório
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <FormDescription>
                  Selecione os campos que farão parte deste questionário
                </FormDescription>
                {editForm.formState.errors.fieldIds && (
                  <p className="text-sm text-red-500">
                    {editForm.formState.errors.fieldIds.message}
                  </p>
                )}
              </div>

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
