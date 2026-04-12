// src/app/(protected)/questionnaire-templates/_components/use-template-dialog.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createDoctorQuestionnaire,
  getCurrentDoctor,
  getMyDoctors,
} from "@/actions/my-questionnaires";

interface UseTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: any;
}

export function UseTemplateDialog({
  open,
  onOpenChange,
  template,
}: UseTemplateDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Buscar médicos disponíveis
  useEffect(() => {
    async function loadDoctors() {
      try {
        const myDoctors = await getMyDoctors();
        const currentDoctor = await getCurrentDoctor();

        setDoctors(myDoctors);
        if (currentDoctor) {
          setDoctorId(currentDoctor.id);
        } else if (myDoctors.length > 0) {
          setDoctorId(myDoctors[0].id);
        }
      } catch (error) {
        console.error("Erro ao carregar médicos:", error);
      }
    }
    if (open) {
      loadDoctors();
    }
  }, [open]);

  if (!template) return null;

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Digite um nome para o questionário");
      return;
    }
    if (!doctorId) {
      toast.error("Selecione um médico");
      return;
    }

    setIsLoading(true);
    try {
      await createDoctorQuestionnaire({
        doctorId: doctorId,
        templateId: template.id,
        name: name.trim(),
      });
      toast.success("Questionário criado com sucesso");
      onOpenChange(false);
      router.push("/my-questionnaires");
    } catch (error: any) {
      toast.error(error.message || "Erro ao criar questionário");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Usar Template</DialogTitle>
          <DialogDescription>
            Crie um questionário personalizado baseado no template "
            {template.name}"
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Seleção do Médico */}
          {doctors.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="doctor">Médico</Label>
              <Select value={doctorId} onValueChange={setDoctorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      Dr(a). {doctor.name} - {doctor.specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="name">Nome do questionário</Label>
            <Input
              id="name"
              placeholder="Ex: Minha Anamnese Personalizada"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <p className="text-muted-foreground text-sm">
              Este será o nome do seu questionário personalizado
            </p>
          </div>

          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm">
              <span className="font-medium">Template base:</span>{" "}
              {template.name}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {template.fieldsCount} campos • {template.category}
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? "Criando..." : "Criar Questionário"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
