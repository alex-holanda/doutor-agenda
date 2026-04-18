// src/app/(protected)/question-fields/_components/fields-table.tsx
"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Pencil, Trash2, Search, Eye } from "lucide-react";
import { toast } from "sonner";
import { FieldForm } from "./field-form";
import {
  updateQuestionField,
  deleteQuestionField,
} from "@/actions/question-fields";

interface FieldsTableProps {
  fields: any[];
}

const categoryLabels: Record<string, string> = {
  vital_signs: "Sinais Vitais",
  anamnesis: "Anamnese",
  physical_exam: "Exame Físico",
  prescription: "Prescrição",
  custom: "Personalizado",
};

const typeLabels: Record<string, string> = {
  text: "Texto",
  textarea: "Área de Texto",
  number: "Número",
  select: "Seleção",
  multi_select: "Múltipla Escolha",
  radio: "Radio",
  checkbox: "Checkbox",
  date: "Data",
  time: "Hora",
  boolean: "Sim/Não",
  scale: "Escala",
};

export function FieldsTable({ fields: initialFields }: FieldsTableProps) {
  const [fields, setFields] = useState(initialFields);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingField, setEditingField] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewingField, setViewingField] = useState<any>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const filteredFields = fields.filter((field) => {
    const matchesSearch =
      field.name.toLowerCase().includes(search.toLowerCase()) ||
      field.fieldKey.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = async (data: any) => {
    try {
      await updateQuestionField(editingField.id, data);
      toast.success("Campo atualizado com sucesso");
      setIsEditOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar campo");
    }
  };

  const handleDelete = async (id: string, isSystem: boolean) => {
    if (isSystem) {
      toast.error("Campos do sistema não podem ser excluídos");
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este campo?")) return;

    try {
      await deleteQuestionField(id);
      toast.success("Campo excluído com sucesso");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao excluir campo");
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar campos..."
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
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Field Key</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Obrigatório</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFields.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-muted-foreground text-center"
                >
                  Nenhum campo encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredFields.map((field) => (
                <TableRow key={field.id}>
                  <TableCell className="font-medium">{field.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {field.fieldKey}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {typeLabels[field.fieldType] || field.fieldType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {field.isRequired ? (
                      <Badge
                        variant="default"
                        className="bg-green-100 text-green-800"
                      >
                        Sim
                      </Badge>
                    ) : (
                      <Badge variant="outline">Não</Badge>
                    )}
                  </TableCell>
                  <TableCell>{field.unit || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setViewingField(field);
                        setIsViewOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingField(field);
                        setIsEditOpen(true);
                      }}
                      disabled={field.isSystem}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(field.id, field.isSystem)}
                      disabled={field.isSystem}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Dialog de Visualização */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewingField?.name}</DialogTitle>
            <DialogDescription>Detalhes do campo</DialogDescription>
          </DialogHeader>
          {viewingField && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-muted-foreground text-sm">Field Key</p>
                  <p className="font-mono text-sm">{viewingField.fieldKey}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Tipo</p>
                  <p>
                    {typeLabels[viewingField.fieldType] ||
                      viewingField.fieldType}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Categoria</p>
                  <p>
                    {categoryLabels[viewingField.category] ||
                      viewingField.category}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Unidade</p>
                  <p>{viewingField.unit || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Obrigatório</p>
                  <p>{viewingField.isRequired ? "Sim" : "Não"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Campo do Sistema
                  </p>
                  <p>{viewingField.isSystem ? "Sim" : "Não"}</p>
                </div>
              </div>
              {viewingField.description && (
                <div>
                  <p className="text-muted-foreground text-sm">Descrição</p>
                  <p className="text-sm">{viewingField.description}</p>
                </div>
              )}
              {viewingField.helpText && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    Texto de ajuda
                  </p>
                  <p className="text-sm">{viewingField.helpText}</p>
                </div>
              )}
              {viewingField.options && viewingField.options.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm">Opções</p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {viewingField.options.map((opt: string) => (
                      <Badge key={opt} variant="outline">
                        {opt}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar campo</DialogTitle>
            <DialogDescription>
              Altere as informações do campo
            </DialogDescription>
          </DialogHeader>
          {editingField && (
            <FieldForm
              initialData={editingField}
              onSubmit={handleEdit}
              isLoading={false}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
