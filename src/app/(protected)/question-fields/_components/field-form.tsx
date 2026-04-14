// src/app/(protected)/question-fields/_components/field-form.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

// Schema simplificado igual ao questionnaire-form
const formSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  fieldType: z.string().min(1, "Tipo é obrigatório"),
  description: z.string().optional(),
  unit: z.string().optional(),
  minValue: z.any().optional(),
  maxValue: z.any().optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  isRequired: z.boolean().default(false),
});

interface FieldFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

const fieldTypes = [
  { value: "text", label: "Texto" },
  { value: "textarea", label: "Área de Texto" },
  { value: "number", label: "Número" },
  { value: "select", label: "Seleção" },
  { value: "multi_select", label: "Múltipla Escolha" },
  { value: "radio", label: "Radio" },
  { value: "checkbox", label: "Checkbox" },
  { value: "date", label: "Data" },
  { value: "time", label: "Hora" },
  { value: "boolean", label: "Sim/Não" },
  { value: "scale", label: "Escala" },
];

export function FieldForm({
  initialData,
  onSubmit,
  isLoading,
}: FieldFormProps) {
  const [options, setOptions] = useState<string[]>(initialData?.options || []);
  const [newOption, setNewOption] = useState("");

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      fieldType: initialData?.fieldType || "text",
      description: initialData?.description || "",
      unit: initialData?.unit || "",
      minValue: initialData?.minValue || "",
      maxValue: initialData?.maxValue || "",
      placeholder: initialData?.placeholder || "",
      helpText: initialData?.helpText || "",
      isRequired: initialData?.isRequired || false,
    },
  });

  const fieldType = form.watch("fieldType");
  const showOptions = ["select", "multi_select", "radio", "checkbox"].includes(
    fieldType,
  );
  const showRange = fieldType === "number" || fieldType === "scale";

  const handleAddOption = () => {
    if (newOption.trim() && !options.includes(newOption.trim())) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (option: string) => {
    setOptions(options.filter((o) => o !== option));
  };

  const handleSubmit = async (data: any) => {
    const submitData = {
      ...data,
      options: showOptions ? options : null,
      minValue: data.minValue ? Number(data.minValue) : null,
      maxValue: data.maxValue ? Number(data.maxValue) : null,
    };
    await onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome do campo *</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Pressão Arterial" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="fieldType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {showOptions && (
          <div className="space-y-2">
            <FormLabel>Opções</FormLabel>
            <div className="flex gap-2">
              <Input
                placeholder="Adicionar opção"
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyPress={(e) =>
                  e.key === "Enter" && (e.preventDefault(), handleAddOption())
                }
              />
              <Button type="button" onClick={handleAddOption}>
                Adicionar
              </Button>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {options.map((opt) => (
                <Badge key={opt} variant="secondary" className="gap-1">
                  {opt}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => handleRemoveOption(opt)}
                  />
                </Badge>
              ))}
            </div>
            <FormDescription>Opções disponíveis para seleção</FormDescription>
          </div>
        )}

        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unidade</FormLabel>
              <FormControl>
                <Input placeholder="Ex: mmHg, bpm, kg" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {showRange && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="minValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor mínimo</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor máximo</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <FormField
          control={form.control}
          name="placeholder"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Placeholder</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Digite aqui..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="helpText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de ajuda</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Texto explicativo para o usuário"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição interna do campo" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isRequired"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <FormLabel>Campo obrigatório</FormLabel>
                <FormDescription>
                  Marcar este campo como obrigatório no questionário
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
