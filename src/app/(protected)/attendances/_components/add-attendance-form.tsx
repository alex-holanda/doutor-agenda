"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { addAttendance } from "@/actions/add-attendance";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { doctorsTable, patientsTable } from "@/db/schema";

const formSchema = z.object({
  patientId: z.string().min(1, {
    message: "Paciente é obrigatório.",
  }),
  doctorId: z.string().min(1, {
    message: "Médico é obrigatório.",
  }),
  type: z.enum(["walk_in", "emergency"], {
    message: "Tipo de atendimento é obrigatório.",
  }),
  chiefComplaint: z.string().optional(),
  notes: z.string().optional(),
});

interface AddWalkInAttendanceFormProps {
  isOpen: boolean;
  patients: (typeof patientsTable.$inferSelect)[];
  doctors: (typeof doctorsTable.$inferSelect)[];
  onSuccess?: () => void;
}

const AddWalkInAttendanceForm = ({
  isOpen,
  patients,
  doctors,
  onSuccess,
}: AddWalkInAttendanceFormProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    shouldUnregister: true,
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientId: "",
      doctorId: "",
      type: "walk_in",
      chiefComplaint: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        patientId: "",
        doctorId: "",
        type: "walk_in",
        chiefComplaint: "",
        notes: "",
      });
    }
  }, [isOpen, form]);

  const createAttendanceAction = useAction(addAttendance, {
    onSuccess: () => {
      toast.success("Atendimento iniciado com sucesso.");
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Erro ao iniciar atendimento.");
      console.error(error);
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    createAttendanceAction.execute(values);
  };

  return (
    <DialogContent className="sm:max-w-[500px] max-h-[calc(100vh-2rem)] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Novo atendimento</DialogTitle>
        <DialogDescription>
          Registre um atendimento de emergência ou avulso.
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Tipo de Atendimento */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de atendimento</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="walk_in">Avulso</SelectItem>
                    <SelectItem value="emergency">Emergência</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Paciente */}
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Médico */}
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Queixa principal */}
          <FormField
            control={form.control}
            name="chiefComplaint"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Queixa principal</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descreva a queixa principal do paciente..."
                    className="resize-none"
                    rows={3}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Observações */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Observações</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Observações adicionais..."
                    className="resize-none"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <DialogFooter>
            <Button type="submit" disabled={createAttendanceAction.isPending}>
              {createAttendanceAction.isPending
                ? "Iniciando..."
                : "Iniciar atendimento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
};

export default AddWalkInAttendanceForm;
