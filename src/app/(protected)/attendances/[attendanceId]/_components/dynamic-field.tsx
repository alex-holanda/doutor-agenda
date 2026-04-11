// app/attendances/[attendanceId]/_components/dynamic-field.tsx
"use client";

import {
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Control } from "react-hook-form";

interface Field {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  placeholder?: string | null;
  helpText?: string | null;
  isRequired?: boolean | null;
  options?: string[] | null;
  minValue?: number | null;
  maxValue?: number | null;
}

interface DynamicFieldProps {
  field: Field;
  control: Control<any>;
  disabled?: boolean;
}

export function DynamicField({ field, control, disabled }: DynamicFieldProps) {
  const renderField = () => {
    switch (field.fieldType) {
      case "text":
        return (
          <FormControl>
            <Input placeholder={field.placeholder || ""} disabled={disabled} />
          </FormControl>
        );

      case "textarea":
        return (
          <FormControl>
            <Textarea
              placeholder={field.placeholder || ""}
              rows={4}
              disabled={disabled}
            />
          </FormControl>
        );

      case "number":
        return (
          <FormControl>
            <Input
              type="number"
              placeholder={field.placeholder || ""}
              min={field.minValue || undefined}
              max={field.maxValue || undefined}
              disabled={disabled}
            />
          </FormControl>
        );

      case "select":
        return (
          <Select disabled={disabled}>
            <FormControl>
              <SelectTrigger>
                <SelectValue
                  placeholder={field.placeholder || "Selecione..."}
                />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "radio":
        return (
          <FormControl>
            <RadioGroup disabled={disabled} className="flex flex-col space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${field.fieldKey}-${option}`}
                  />
                  <label htmlFor={`${field.fieldKey}-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </FormControl>
        );

      case "checkbox":
      case "multi_select":
        return (
          <FormControl>
            <div className="flex flex-col space-y-2">
              {field.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <Checkbox
                    id={`${field.fieldKey}-${option}`}
                    disabled={disabled}
                  />
                  <label htmlFor={`${field.fieldKey}-${option}`}>
                    {option}
                  </label>
                </div>
              ))}
            </div>
          </FormControl>
        );

      case "boolean":
        return (
          <FormControl>
            <div className="flex items-center space-x-2">
              <Switch id={field.fieldKey} disabled={disabled} />
              <label htmlFor={field.fieldKey}>
                {field.placeholder || "Sim/Não"}
              </label>
            </div>
          </FormControl>
        );

      case "date":
        return (
          <FormControl>
            <Input type="date" disabled={disabled} />
          </FormControl>
        );

      case "time":
        return (
          <FormControl>
            <Input type="time" disabled={disabled} />
          </FormControl>
        );

      case "scale":
        return (
          <FormControl>
            <div className="space-y-2">
              <Slider
                min={field.minValue || 0}
                max={field.maxValue || 10}
                step={1}
                disabled={disabled}
                className="w-full"
              />
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{field.minValue || 0}</span>
                <span>{field.maxValue || 10}</span>
              </div>
            </div>
          </FormControl>
        );

      default:
        return (
          <FormControl>
            <Input placeholder={field.placeholder || ""} disabled={disabled} />
          </FormControl>
        );
    }
  };

  return (
    <FormField
      control={control}
      name={field.fieldKey}
      render={({ field: formField }) => (
        <FormItem>
          <FormLabel>
            {field.label}
            {field.isRequired && <span className="ml-1 text-red-500">*</span>}
          </FormLabel>
          {renderField()}
          {field.helpText && (
            <p className="text-muted-foreground text-xs">{field.helpText}</p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
