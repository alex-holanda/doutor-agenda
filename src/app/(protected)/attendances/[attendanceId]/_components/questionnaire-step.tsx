// src/app/(protected)/attendances/[attendanceId]/_components/questionnaire-step.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface QuestionnaireStepProps {
  fields: any[];
  title: string;
  initialData?: any;
}

export function QuestionnaireStep({
  fields,
  title,
  initialData,
}: QuestionnaireStepProps) {
  const renderField = (field: any) => {
    const name = field.fieldKey;
    const defaultValue = initialData?.[name] || "";
    const isRequired = field.isRequired === true;

    switch (field.fieldType) {
      case "textarea":
        return (
          <Textarea
            name={name}
            placeholder={field.placeholder || ""}
            rows={3}
            defaultValue={defaultValue}
            required={isRequired}
          />
        );
      case "select":
        return (
          <select
            name={name}
            className="w-full rounded-md border p-2"
            defaultValue={defaultValue}
            required={isRequired}
          >
            <option value="">Selecione...</option>
            {field.options?.map((opt: string) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      case "multi_select":
        return (
          <div className="space-y-2">
            {field.options?.map((opt: string) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={`${name}[]`}
                  value={opt}
                  defaultChecked={
                    Array.isArray(defaultValue) && defaultValue.includes(opt)
                  }
                  className="h-4 w-4"
                />
                <label>{opt}</label>
              </div>
            ))}
          </div>
        );
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt: string) => (
              <div key={opt} className="flex items-center gap-2">
                <input
                  type="radio"
                  name={name}
                  value={opt}
                  defaultChecked={defaultValue === opt}
                  className="h-4 w-4"
                  required={isRequired}
                />
                <label>{opt}</label>
              </div>
            ))}
          </div>
        );
      case "boolean":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name={name}
              defaultChecked={defaultValue === true}
              className="h-4 w-4"
            />
            <label>{field.placeholder || "Sim"}</label>
          </div>
        );
      case "number":
        return (
          <Input
            type="number"
            name={name}
            placeholder={field.placeholder || ""}
            step={field.fieldType === "scale" ? 1 : "any"}
            min={field.minValue}
            max={field.maxValue}
            defaultValue={defaultValue}
            required={isRequired}
          />
        );
      default:
        return (
          <Input
            type="text"
            name={name}
            placeholder={field.placeholder || ""}
            defaultValue={defaultValue}
            required={isRequired}
          />
        );
    }
  };

  if (!fields || fields.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Nenhum campo configurado para este questionário
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {fields.map((field, index) => {
          const isRequired = field.isRequired === true;
          const fieldLabel =
            field.label || field.name || field.fieldKey || `Campo ${index + 1}`;

          return (
            <div key={field.id || index} className="space-y-2">
              <Label>
                {fieldLabel}
                {isRequired && <span className="ml-1 text-red-500">*</span>}
                {field.unit && (
                  <span className="text-muted-foreground ml-1">
                    ({field.unit})
                  </span>
                )}
              </Label>
              {renderField(field)}
              {field.helpText && (
                <p className="text-muted-foreground text-xs">
                  {field.helpText}
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
