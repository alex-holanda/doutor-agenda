"use server";

import { headers } from "next/headers";
import { and, eq, desc } from "drizzle-orm";

import { db } from "@/db";
import {
  attendancesTable,
  vitalSignsTable,
  professionalsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

export async function getPatientVitalHistory(patientId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || !session?.user?.clinic) {
    throw new Error("Não autorizado");
  }

  const attendances = await db.query.attendancesTable.findMany({
    where: and(
      eq(attendancesTable.patientId, patientId),
      eq(attendancesTable.clinicId, session.user.clinic.id),
    ),
    with: {
      vitalSigns: true,
      doctor: true,
    },
    orderBy: (attendances, { desc }) => [desc(attendancesTable.createdAt)],
  });

  type VitalSign = {
  bloodPressureSystolic: number | null;
  bloodPressureDiastolic: number | null;
  heartRate: number | null;
  respiratoryRate: number | null;
  temperature: string | null;
  oxygenSaturation: number | null;
  bloodGlucose: number | null;
  weight: string | null;
  height: string | null;
  bmi: string | null;
  abdominalCircumference: string | null;
  hipCircumference: string | null;
  waistHipRatio: string | null;
  armCircumference: string | null;
  calfCircumference: string | null;
  painScale: number | null;
  notes: string | null;
};

const vitalHistory: (VitalSign & { id: string; date: Date; professional: string })[] = attendances
    .filter((a) => a.vitalSigns && a.vitalSigns.length > 0)
    .map((a) => {
      const vital = a.vitalSigns[0];
      return ({
        id: a.id,
        date: a.createdAt,
        professional: a.doctor.name,
        bloodPressureSystolic: vital.bloodPressureSystolic,
        bloodPressureDiastolic: vital.bloodPressureDiastolic,
        heartRate: vital.heartRate,
        respiratoryRate: vital.respiratoryRate,
        temperature: vital.temperature,
        oxygenSaturation: vital.oxygenSaturation,
        bloodGlucose: vital.bloodGlucose,
        weight: vital.weight,
        height: vital.height,
        bmi: vital.bmi,
        abdominalCircumference: vital.abdominalCircumference,
        hipCircumference: vital.hipCircumference,
        waistHipRatio: vital.waistHipRatio,
        armCircumference: vital.armCircumference,
        calfCircumference: vital.calfCircumference,
        painScale: vital.painScale,
        notes: vital.notes,
      });
    });

  const lastVital = vitalHistory[0] || null;

  const classifyPA = (systolic: number | null, diastolic: number | null) => {
    if (!systolic || !diastolic) return "Não mensurado";
    if (systolic < 120 && diastolic < 80) return "Ótima";
    if (systolic < 130 && diastolic < 85) return "Normal";
    if (systolic < 140 && diastolic < 90) return "Limítrofe";
    return "Hipertensão";
  };

  const classifyFC = (heartRate: number | null) => {
    if (!heartRate) return "Não mensurado";
    if (heartRate < 60) return "Bradicardia";
    if (heartRate > 100) return "Taquicardia";
    return "Normal";
  };

  const classifyO2 = (oxygenSaturation: number | null) => {
    if (!oxygenSaturation) return "Não mensurado";
    if (oxygenSaturation >= 95) return "Normal";
    if (oxygenSaturation >= 90) return "Hipoxemia leve";
    return "Hipoxemia grave";
  };

  const classifyBMI = (bmi: string | null) => {
    if (!bmi) return "Não mensurado";
    const bmiNum = parseFloat(bmi);
    if (bmiNum < 18.5) return "Baixo peso";
    if (bmiNum < 25) return "Peso normal";
    if (bmiNum < 30) return "Sobrepeso";
    return "Obesidade";
  };

  const calculateRiskScore = (vital: any) => {
    let score = 0;
    if (vital.bloodPressureSystolic && vital.bloodPressureSystolic >= 140) score += 2;
    else if (vital.bloodPressureSystolic && vital.bloodPressureSystolic >= 130) score += 1;

    if (vital.abdominalCircumference) {
      const ac = parseFloat(vital.abdominalCircumference);
      if (ac > 102) score += 2;
      else if (ac > 88) score += 1;
    }

    if (vital.bmi) {
      const bmiNum = parseFloat(vital.bmi);
      if (bmiNum >= 30) score += 2;
      else if (bmiNum >= 25) score += 1;
    }

    if (score >= 4) return "Alto";
    if (score >= 2) return "Moderado";
    return "Baixo";
  };

  return {
    history: vitalHistory,
    lastVital: lastVital
      ? {
          date: lastVital.date,
          bloodPressure: lastVital.bloodPressureSystolic
            ? `${lastVital.bloodPressureSystolic}/${lastVital.bloodPressureDiastolic}`
            : null,
          bloodPressureSystolic: lastVital.bloodPressureSystolic,
          bloodPressureDiastolic: lastVital.bloodPressureDiastolic,
          classifyPA: classifyPA(
            lastVital.bloodPressureSystolic,
            lastVital.bloodPressureDiastolic,
          ),
          heartRate: lastVital.heartRate,
          classifyFC: classifyFC(lastVital.heartRate),
          oxygenSaturation: lastVital.oxygenSaturation,
          classifyO2: classifyO2(lastVital.oxygenSaturation),
          temperature: lastVital.temperature,
          weight: lastVital.weight,
          height: lastVital.height,
          bmi: lastVital.bmi,
          classifyBMI: classifyBMI(lastVital.bmi),
          abdominalCircumference: lastVital.abdominalCircumference,
          waistHipRatio: lastVital.waistHipRatio,
          painScale: lastVital.painScale,
          riskScore: calculateRiskScore(lastVital),
        }
      : null,
    pressureHistory: vitalHistory
      .filter((v) => v.bloodPressureSystolic)
      .map((v) => ({
        date: v.date,
        systolic: v.bloodPressureSystolic,
        diastolic: v.bloodPressureDiastolic,
        classify: classifyPA(v.bloodPressureSystolic, v.bloodPressureDiastolic),
      }))
      .reverse(),
    weightHistory: vitalHistory
      .filter((v) => v.weight)
      .map((v) => ({
        date: v.date,
        weight: v.weight ? parseFloat(v.weight) : null,
        bmi: v.bmi ? parseFloat(v.bmi) : null,
      }))
      .reverse(),
    cardiacHistory: vitalHistory
      .filter((v) => v.heartRate || v.oxygenSaturation)
      .map((v) => ({
        date: v.date,
        heartRate: v.heartRate,
        classifyFC: classifyFC(v.heartRate),
        oxygenSaturation: v.oxygenSaturation,
        classifyO2: classifyO2(v.oxygenSaturation),
      }))
      .reverse(),
  };
}