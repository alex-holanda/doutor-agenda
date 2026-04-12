// src/app/(protected)/my-questionnaires/_components/edit-questionnaire-dialog.tsx
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { updateQuestionnaire } from "@/actions/my-questionnaires";

interface EditQuestionnaireDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  questionnaire: any;
}

export function EditQuestionnaireDialog({
  open,
  onOpenChange,
  questionnaire,
}: EditQuestionnaireDialogProps) {
  const [name, setName] = useState(questionnaire?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Digite um nome para o questionário");
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateQuestionnaire(questionnaire.id, {
        name: name.trim(),
      });
      if (result.success) {
        toast.success("Questionário atualizado com sucesso");
        onOpenChange(false);
        window.location.reload();
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao atualizar questionário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar Questionário</DialogTitle>
          <DialogDescription>
            Altere o nome do seu questionário personalizado
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do questionário</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite o nome"
            />
          </div>
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm">
              <span className="font-medium">Template base:</span>{" "}
              {questionnaire.template?.name}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {questionnaire.template?.fields?.length || 0} campos
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
