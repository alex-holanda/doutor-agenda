// src/app/(protected)/question-fields/_components/add-field-button.tsx
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
import { FieldForm } from "./field-form";
import { createQuestionField } from "@/actions/question-fields";

export default function AddFieldButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      await createQuestionField(data);
      toast.success("Campo criado com sucesso");
      setIsOpen(false);
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar campo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Novo Campo
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar novo campo</DialogTitle>
          <DialogDescription>
            Adicione um novo campo ao catálogo para usar nos questionários
          </DialogDescription>
        </DialogHeader>
        <FieldForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}
