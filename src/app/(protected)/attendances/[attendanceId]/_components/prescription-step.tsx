// src/app/(protected)/attendances/[attendanceId]/_components/prescription-step.tsx
"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getAvailableTimes } from "@/actions/get-available-times";

interface PrescriptionStepProps {
  initialData?: {
    medications?: string;
    exams?: string;
    orientations?: string;
    returnDate?: string | Date;
    returnTime?: string;
    doctorName?: string;
    appointmentDate?: string;
  };
  doctorName?: string;
  appointmentDate?: string;
  doctorId?: string;
}

export function PrescriptionStep({
  initialData,
  doctorName,
  appointmentDate,
  doctorId,
}: PrescriptionStepProps) {
  // Extrair hora do returnTime ou returnDate
  const getInitialTime = () => {
    if (initialData?.returnTime) {
      return initialData.returnTime;
    }
    if (initialData?.returnDate && typeof initialData.returnDate === "string") {
      if (initialData.returnDate.includes("T")) {
        return dayjs(initialData.returnDate).format("HH:mm:ss");
      }
    }
    return "";
  };

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(() => {
    if (initialData?.returnDate) {
      const date = dayjs(initialData.returnDate).toDate();
      return date;
    }
    return undefined;
  });

  const [selectedTime, setSelectedTime] = useState<string>(getInitialTime());

  const { data: availableTimes, isLoading } = useQuery({
    queryKey: ["available-times", selectedDate, doctorId],
    queryFn: () =>
      getAvailableTimes({
        date: dayjs(selectedDate).format("YYYY-MM-DD"),
        doctorId: doctorId || "",
      }),
    enabled: !!selectedDate && !!doctorId,
  });

  const timeSlots = availableTimes?.data || [];

  const isDateTimeEnabled = !!doctorId;

  // Construir data e hora separados para enviar ao salvar
  const getReturnDateTimeForSubmit = () => {
    if (!selectedDate || !selectedTime) {
      return { returnDate: "", returnTime: "" };
    }

    try {
      const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
      const timeWithSeconds = selectedTime ? `${selectedTime}` : "";
      return { returnDate: dateStr, returnTime: timeWithSeconds };
    } catch {
      return { returnDate: "", returnTime: "" };
    }
  };

  const { returnDate, returnTime } = getReturnDateTimeForSubmit();

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  };

  // Resetar horário apenas quando a data mudar MANUALMENTE (não na montagem)
  const handleDateChange = (date: Date | undefined) => {
    setSelectedDate(date);
    // Só reseta o horário se a data for diferente da inicial
    if (date && initialData?.returnDate) {
      const originalDate = dayjs(initialData.returnDate).format("YYYY-MM-DD");
      const newDate = dayjs(date).format("YYYY-MM-DD");
      if (originalDate !== newDate) {
        setSelectedTime("");
      }
    } else if (date) {
      setSelectedTime("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescrição Médica</CardTitle>
        {doctorName && (
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <span>{doctorName}</span>
            {appointmentDate && (
              <>
                <span>•</span>
                <span>
                  {format(new Date(appointmentDate), "dd/MM/yyyy 'às' HH:mm", {
                    locale: ptBR,
                  })}
                </span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Medicamentos</Label>
          <Textarea
            name="medications"
            placeholder="Liste os medicamentos, dosagens e horários..."
            rows={4}
            defaultValue={initialData?.medications || ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Exames Solicitados</Label>
          <Textarea
            name="exams"
            placeholder="Liste os exames solicitados..."
            rows={3}
            defaultValue={initialData?.exams || ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Orientações</Label>
          <Textarea
            name="orientations"
            placeholder="Orientações ao paciente..."
            rows={3}
            defaultValue={initialData?.orientations || ""}
          />
        </div>

        <div className="space-y-2">
          <Label>Data de Retorno</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={!isDateTimeEnabled}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "PPP", { locale: ptBR })
                    ) : (
                      <span>Selecione a data</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateChange}
                    disabled={(date) => {
                      const now = new Date();
                      now.setHours(0, 0, 0, 0);
                      const isPast = date < now;
                      return isPast || !isDateAvailable(date);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-1">
              <Select
                value={selectedTime}
                onValueChange={setSelectedTime}
                disabled={!selectedDate || isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={
                      isLoading
                        ? "Carregando horários..."
                        : "Selecione o horário"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.length === 0 && !isLoading && selectedDate && (
                    <div className="text-muted-foreground p-2 text-center text-sm">
                      Nenhum horário disponível
                    </div>
                  )}
                  {timeSlots.map((time: any) => {
                    const isOriginalTime =
                      time.value === initialData?.returnTime;
                    const isCurrentSelected = time.value === selectedTime;
                    // Permite selecionar se for o horário original do atendimento OU se estiver disponível
                    const isSelectable = time.available || isOriginalTime;
                    const showUnavailable = !time.available && !isOriginalTime;

                    return (
                      <SelectItem
                        key={time.value}
                        value={time.value}
                        disabled={!isSelectable}
                      >
                        {time.label} {showUnavailable && "(Indisponível)"}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <input type="hidden" name="returnDate" value={returnDate} />
          <input type="hidden" name="returnTime" value={returnTime} />
        </div>
      </CardContent>
    </Card>
  );
}
