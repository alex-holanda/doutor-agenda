// src/app/(protected)/my-questionnaires/_components/template-selector.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { Search, Heart, FileText, Activity, Pill, User } from "lucide-react";
import { getQuestionnaireTemplates } from "@/actions/questionnaire-templates";
import { getCurrentDoctor, getMyDoctors } from "@/actions/my-questionnaires";

interface TemplateSelectorProps {
  onSelect: (
    templateId: string,
    name: string,
    doctorId?: string,
  ) => Promise<void>;
  isLoading: boolean;
}

const iconMap: Record<string, any> = {
  vital_signs: Heart,
  anamnesis: FileText,
  physical_exam: Activity,
  prescription: Pill,
  custom: FileText,
};

export function TemplateSelector({
  onSelect,
  isLoading,
}: TemplateSelectorProps) {
  const [search, setSearch] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [name, setName] = useState("");
  const [doctors, setDoctors] = useState<any[]>([]);

  const { data: templates = [], isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["questionnaire-templates"],
    queryFn: () => getQuestionnaireTemplates(),
  });

  // Buscar médicos disponíveis
  useEffect(() => {
    async function loadDoctors() {
      try {
        const myDoctors = await getMyDoctors();
        const currentDoctor = await getCurrentDoctor();

        if (myDoctors.length > 0) {
          setDoctors(myDoctors);
          if (currentDoctor) {
            setSelectedDoctorId(currentDoctor.id);
          } else if (myDoctors.length > 0) {
            setSelectedDoctorId(myDoctors[0].id);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar médicos:", error);
      }
    }
    loadDoctors();
  }, []);

  const filteredTemplates = templates.filter((template: any) =>
    template.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (template: any) => {
    setSelectedTemplate(template);
    setName(`${template.name} (Personalizado)`);
  };

  const handleConfirm = () => {
    if (selectedTemplate && name.trim() && selectedDoctorId) {
      onSelect(selectedTemplate.id, name.trim(), selectedDoctorId);
    }
  };

  if (isLoadingTemplates) {
    return <div className="py-8 text-center">Carregando templates...</div>;
  }

  if (!selectedTemplate) {
    return (
      <div className="space-y-4">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            placeholder="Buscar templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="grid max-h-[400px] gap-3 overflow-y-auto">
          {filteredTemplates.map((template: any) => {
            const Icon = iconMap[template.category] || FileText;
            return (
              <Card
                key={template.id}
                className="hover:border-primary cursor-pointer transition-colors"
                onClick={() => handleSelect(template)}
              >
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="bg-muted rounded-lg p-2">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {template.fieldsCount} campos •{" "}
                      {template.isSystem ? "Sistema" : "Personalizado"}
                    </CardDescription>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  }

  const Icon = iconMap[selectedTemplate.category] || FileText;

  return (
    <div className="space-y-4">
      <div className="text-muted-foreground flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSelectedTemplate(null)}
        >
          ← Voltar
        </Button>
        <span>Selecionado: {selectedTemplate.name}</span>
      </div>

      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex items-center gap-4">
            <div className="bg-muted rounded-lg p-2">
              <Icon className="h-8 w-8" />
            </div>
            <div>
              <p className="font-medium">{selectedTemplate.name}</p>
              <p className="text-muted-foreground text-sm">
                {selectedTemplate.fieldsCount} campos
              </p>
            </div>
          </div>

          {/* Seleção do Médico */}
          {doctors.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Médico</Label>
              <Select
                value={selectedDoctorId}
                onValueChange={setSelectedDoctorId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o médico" />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Dr(a). {doctor.name}</span>
                        <span className="text-muted-foreground text-xs">
                          • {doctor.specialty}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-sm font-medium">Nome do questionário</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Digite um nome para seu questionário"
            />
          </div>

          <Button
            className="w-full"
            onClick={handleConfirm}
            disabled={!name.trim() || !selectedDoctorId || isLoading}
          >
            {isLoading ? "Criando..." : "Criar Questionário"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
