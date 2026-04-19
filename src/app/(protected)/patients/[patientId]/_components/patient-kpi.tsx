"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { getPatientVitalHistory } from "@/actions/get-patient-vital-history";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PatientKPIProps {
  patientId: string;
}

export function PatientKPI({ patientId }: PatientKPIProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["patient-vital-history", patientId],
    queryFn: () => getPatientVitalHistory(patientId),
  });

  if (isLoading) {
    return (
      <CardContent className="text-muted-foreground py-8 text-center">
        Carregando dados...
      </CardContent>
    );
  }

  if (!data || data.history.length === 0) {
    return (
      <CardContent className="text-muted-foreground py-8 text-center">
        Nenhum dado de sinais vitais encontrado
      </CardContent>
    );
  }

  const { lastVital, pressureHistory, weightHistory, cardiacHistory } = data;

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Alto":
        return <Badge variant="destructive">{risk}</Badge>;
      case "Moderado":
        return <Badge variant="secondary">{risk}</Badge>;
      default:
        return <Badge>{risk}</Badge>;
    }
  };

  const getClassBadge = (classify: string) => {
    if (
      classify === "Normal" ||
      classify === "Ótima" ||
      classify === "Peso normal"
    ) {
      return <Badge>{classify}</Badge>;
    }
    if (
      classify === "Hipertensão" ||
      classify === "Taquicardia" ||
      classify === "Obesidade"
    ) {
      return <Badge variant="destructive">{classify}</Badge>;
    }
    return <Badge variant="secondary">{classify}</Badge>;
  };

  return (
    <>
      <CardHeader>
        <CardTitle>Evolução Clínica</CardTitle>
        <CardDescription>
          Acompanhamento dos indicadores ao longo dos atendimentos
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="summary">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="summary">Resumo</TabsTrigger>
            <TabsTrigger value="pressure">PA</TabsTrigger>
            <TabsTrigger value="weight">Peso</TabsTrigger>
            <TabsTrigger value="cardiac">Cardíaco</TabsTrigger>
          </TabsList>

          {/* Resumo */}
          <TabsContent value="summary" className="space-y-4">
            {lastVital ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    Pressão Arterial
                  </p>
                  <p className="text-lg font-medium">
                    {lastVital.bloodPressure || "N/A"}
                  </p>
                  {getClassBadge(lastVital.classifyPA)}
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    Frequência Cardíaca
                  </p>
                  <p className="text-lg font-medium">
                    {lastVital.heartRate ? `${lastVital.heartRate} bpm` : "N/A"}
                  </p>
                  {getClassBadge(lastVital.classifyFC)}
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Saturação O²</p>
                  <p className="text-lg font-medium">
                    {lastVital.oxygenSaturation
                      ? `${lastVital.oxygenSaturation}%`
                      : "N/A"}
                  </p>
                  {getClassBadge(lastVital.classifyO2)}
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">Peso</p>
                  <p className="text-lg font-medium">
                    {lastVital.weight
                      ? `${parseFloat(lastVital.weight).toFixed(1)} kg`
                      : "N/A"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    IMC: {lastVital.bmi || "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    Circ. Abdominal
                  </p>
                  <p className="text-lg font-medium">
                    {lastVital.abdominalCircumference
                      ? `${parseFloat(lastVital.abdominalCircumference).toFixed(1)} cm`
                      : "N/A"}
                  </p>
                </div>
                <div className="rounded-lg border p-3">
                  <p className="text-muted-foreground text-xs">
                    Risco Cardiovascular
                  </p>
                  {getRiskBadge(lastVital.riskScore)}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                Sem dados disponíveis
              </p>
            )}
          </TabsContent>

          {/* Pressão Arterial */}
          <TabsContent value="pressure">
            {pressureHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={pressureHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        format(new Date(date), "dd/MM", { locale: ptBR })
                      }
                    />
                    <YAxis domain={[80, 180]} />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "PP", { locale: ptBR })
                      }
                    />
                    <ReferenceLine
                      y={140}
                      stroke="red"
                      strokeDasharray="5 5"
                      label="Limite"
                    />
                    <Line
                      type="monotone"
                      dataKey="systolic"
                      stroke="#ef4444"
                      name="Sistólica"
                    />
                    <Line
                      type="monotone"
                      dataKey="diastolic"
                      stroke="#3b82f6"
                      name="Diastólica"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                Sem dados de pressão arterial
              </p>
            )}
          </TabsContent>

          {/* Peso */}
          <TabsContent value="weight">
            {weightHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weightHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        format(new Date(date), "dd/MM", { locale: ptBR })
                      }
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "PP", { locale: ptBR })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="#22c55e"
                      name="Peso (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                Sem dados de peso
              </p>
            )}
          </TabsContent>

          {/* Frequência Cardíaca */}
          <TabsContent value="cardiac">
            {cardiacHistory.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={cardiacHistory}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        format(new Date(date), "dd/MM", { locale: ptBR })
                      }
                    />
                    <YAxis domain={[40, 150]} />
                    <Tooltip
                      labelFormatter={(date) =>
                        format(new Date(date), "PP", { locale: ptBR })
                      }
                    />
                    <ReferenceLine y={100} stroke="red" strokeDasharray="5 5" />
                    <ReferenceLine y={60} stroke="blue" strokeDasharray="5 5" />
                    <Line
                      type="monotone"
                      dataKey="heartRate"
                      stroke="#f97316"
                      name="FC (bpm)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">
                Sem dados de frequência cardíaca
              </p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </>
  );
}
