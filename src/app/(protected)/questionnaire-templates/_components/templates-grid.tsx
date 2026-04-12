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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/actions/questionnaire-templates";
import { TemplatePreviewDialog } from "./template-preview-dialog";
import { UseTemplateDialog } from "./use-template-dialog";

interface TemplatesGridProps {
  templates: any[];
}

const iconMap: Record<string, any> = {
  vital_signs: Heart,
  anamnesis: FileText,
  physical_exam: Activity,
  prescription: Pill,
  custom: FileText,
};

const colorMap: Record<string, string> = {
  vital_signs: "bg-blue-100 text-blue-700",
  anamnesis: "bg-green-100 text-green-700",
  physical_exam: "bg-purple-100 text-purple-700",
  prescription: "bg-orange-100 text-orange-700",
  custom: "bg-gray-100 text-gray-700",
};

const categoryLabels: Record<string, string> = {
  vital_signs: "Sinais Vitais",
  anamnesis: "Anamnese",
  physical_exam: "Exame Físico",
  prescription: "Prescrição",
  custom: "Personalizado",
};

export function TemplatesGrid({
  templates: initialTemplates,
}: TemplatesGridProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);
  const [useTemplate, setUseTemplate] = useState<any>(null);

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
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
            const Icon = iconMap[template.category] || FileText;
            const colorClass = colorMap[template.category] || colorMap.custom;

            return (
              <Card key={template.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className={`rounded-lg p-2 ${colorClass}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => setPreviewTemplate(template)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDuplicate(template.id)}
                        >
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
                        </DropdownMenuItem>
                        {!template.isSystem && (
                          <>
                            <DropdownMenuItem>
                              <FileEdit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
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
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setPreviewTemplate(template)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={() => setUseTemplate(template)}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Usar Template
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

      {/* Use Template Dialog */}
      <UseTemplateDialog
        open={!!useTemplate}
        onOpenChange={() => setUseTemplate(null)}
        template={useTemplate}
      />
    </div>
  );
}
