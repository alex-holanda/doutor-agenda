// src/app/(protected)/questionnaire-templates/_components/add-template-button.tsx
"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { createQuestionnaireTemplate } from "@/actions/questionnaire-templates";
import { TemplateForm } from "./template-form";

export default function AddTemplateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createQuestionnaireTemplate(data);
      toast.success("Template criado com sucesso");
      setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo template</DialogTitle>
          <DialogDescription>
            Crie um modelo de questionário selecionando os campos desejados
          </DialogDescription>
        </DialogHeader>
        <TemplateForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
