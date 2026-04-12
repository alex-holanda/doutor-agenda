// src/actions/attendances/index.ts
"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";

import { db } from "@/db";
import {
  vitalSignsTable,
  physicalExamsTable,
  prescriptionsTable,
  medicalCertificatesTable,
  questionnaireResponsesTable,
  attendancesTable,
  doctorQuestionnairesTable,
  questionnaireTemplateFieldsTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";

// Iniciar atendimento
export async function startAttendance(attendanceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  await db
    .update(attendancesTable)
    .set({
      status: "in_progress",
      actualStartTime: new Date(),
    })
    .where(eq(attendancesTable.id, attendanceId));

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}

// Finalizar atendimento
export async function completeAttendance(attendanceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  await db
    .update(attendancesTable)
    .set({
      status: "completed",
      actualEndTime: new Date(),
    })
    .where(eq(attendancesTable.id, attendanceId));

  revalidatePath(`/attendances/${attendanceId}`);
  revalidatePath("/attendances");
  return { success: true };
}

// Buscar questionários do médico
export async function getDoctorQuestionnaires(doctorId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const questionnaires = await db.query.doctorQuestionnairesTable.findMany({
    where: eq(doctorQuestionnairesTable.doctorId, doctorId),
    with: {
      template: true,
    },
  });

  const questionnairesWithFields = await Promise.all(
    questionnaires.map(async (q) => {
      const fields = await db.query.questionnaireTemplateFieldsTable.findMany({
        where: eq(questionnaireTemplateFieldsTable.templateId, q.templateId),
        with: {
          field: true,
        },
        orderBy: (fields, { asc }) => [asc(fields.order)],
      });

      return {
        ...q,
        fields: fields.map((f) => f.field),
      };
    }),
  );

  return questionnairesWithFields;
}

// Buscar dados salvos do atendimento
export async function getAttendanceData(attendanceId: string) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const [vitalSigns, physicalExam, prescription, certificate] =
    await Promise.all([
      db.query.vitalSignsTable.findFirst({
        where: eq(vitalSignsTable.attendanceId, attendanceId),
      }),
      db.query.physicalExamsTable.findFirst({
        where: eq(physicalExamsTable.attendanceId, attendanceId),
      }),
      db.query.prescriptionsTable.findFirst({
        where: eq(prescriptionsTable.attendanceId, attendanceId),
      }),
      db.query.medicalCertificatesTable.findFirst({
        where: eq(medicalCertificatesTable.attendanceId, attendanceId),
      }),
    ]);

  const questionnaireResponses =
    await db.query.questionnaireResponsesTable.findMany({
      where: eq(questionnaireResponsesTable.attendanceId, attendanceId),
    });

  const responsesMap: Record<string, any> = {};
  questionnaireResponses.forEach((resp) => {
    if (resp.doctorQuestionnaireId) {
      responsesMap[resp.doctorQuestionnaireId] = resp.responseData;
    }
  });

  return {
    vitalSigns,
    physicalExam,
    prescription,
    certificate,
    questionnaireResponses: responsesMap,
  };
}

// Salvar Sinais Vitais (upsert)
export async function saveVitalSigns(attendanceId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  // Calcular IMC se peso e altura foram fornecidos
  let bmi: string | null = null;
  if (data.weight && data.height) {
    const weightInKg = parseFloat(data.weight);
    const heightInM = parseFloat(data.height) / 100;
    const calculatedBmi = weightInKg / (heightInM * heightInM);
    bmi = calculatedBmi.toFixed(1);
  }

  const existing = await db.query.vitalSignsTable.findFirst({
    where: eq(vitalSignsTable.attendanceId, attendanceId),
  });

  const now = new Date();

  // Converter todos os valores para string ou null (como o Drizzle espera)
  const vitalSignsData = {
    bloodPressureSystolic: data.bloodPressureSystolic
      ? parseInt(data.bloodPressureSystolic)
      : null,
    bloodPressureDiastolic: data.bloodPressureDiastolic
      ? parseInt(data.bloodPressureDiastolic)
      : null,
    heartRate: data.heartRate ? parseInt(data.heartRate) : null,
    respiratoryRate: data.respiratoryRate
      ? parseInt(data.respiratoryRate)
      : null,
    temperature: data.temperature ? data.temperature.toString() : null,
    oxygenSaturation: data.oxygenSaturation
      ? parseInt(data.oxygenSaturation)
      : null,
    bloodGlucose: data.bloodGlucose ? parseInt(data.bloodGlucose) : null,
    weight: data.weight ? data.weight.toString() : null,
    height: data.height ? data.height.toString() : null,
    bmi: bmi,
    painScale: data.painScale ? parseInt(data.painScale) : null,
    notes: data.notes || null,
  };

  if (existing) {
    await db
      .update(vitalSignsTable)
      .set({
        ...vitalSignsData,
        updatedAt: now,
      })
      .where(eq(vitalSignsTable.id, existing.id));
  } else {
    await db.insert(vitalSignsTable).values({
      attendanceId,
      measuredBy: "doctor",
      measuredAt: now,
      ...vitalSignsData,
    });
  }

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}

// Salvar Exame Físico (upsert)
export async function savePhysicalExam(attendanceId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const existing = await db.query.physicalExamsTable.findFirst({
    where: eq(physicalExamsTable.attendanceId, attendanceId),
  });

  const examData = {
    generalState: data.generalState || null,
    consciousnessLevel: data.consciousnessLevel || null,
    hydration: data.hydration || null,
    skinColor: data.skinColor || null,
    lungAuscultation: data.lungAuscultation || null,
    heartAuscultation: data.heartAuscultation || null,
    abdomen: data.abdomen || null,
    extremities: data.extremities || null,
    neurological: data.neurological || null,
    observations: data.observations || null,
  };

  if (existing) {
    await db
      .update(physicalExamsTable)
      .set({ ...examData, updatedAt: new Date() })
      .where(eq(physicalExamsTable.id, existing.id));
  } else {
    await db.insert(physicalExamsTable).values({
      attendanceId,
      examinedAt: new Date(),
      ...examData,
    });
  }

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}

// Salvar Prescrição (upsert)
export async function savePrescription(attendanceId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const existing = await db.query.prescriptionsTable.findFirst({
    where: eq(prescriptionsTable.attendanceId, attendanceId),
  });

  const now = new Date();

  const medications = data.medications?.trim() || null;
  const exams = data.exams?.trim() || null;
  const orientations = data.orientations?.trim() || null;

  let returnDate = null;
  if (data.returnDate && data.returnDate !== "") {
    returnDate = new Date(data.returnDate);
  }

  if (existing) {
    await db
      .update(prescriptionsTable)
      .set({
        medications,
        exams,
        orientations,
        returnDate,
        updatedAt: now,
      })
      .where(eq(prescriptionsTable.id, existing.id));
  } else {
    await db.insert(prescriptionsTable).values({
      attendanceId,
      medications,
      exams,
      orientations,
      returnDate,
      signedAt: now,
      status: "finalized",
    });
  }

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}

// Salvar Atestado (upsert)
export async function saveCertificate(attendanceId: string, data: any) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const days = data.days ? parseInt(data.days) : 0;

  if (!days || days === 0) {
    await db
      .delete(medicalCertificatesTable)
      .where(eq(medicalCertificatesTable.attendanceId, attendanceId));
    return { success: true };
  }

  const existing = await db.query.medicalCertificatesTable.findFirst({
    where: eq(medicalCertificatesTable.attendanceId, attendanceId),
  });

  const now = new Date();
  const endDate = new Date(now);
  endDate.setDate(now.getDate() + days);

  const certificateData = {
    days: days,
    startDate: now,
    endDate: endDate,
    cidCode: data.cidCode || null,
    cidDescription: data.cidDescription || null,
    recommendation: data.recommendation || null,
    issuedAt: now,
  };

  if (existing) {
    await db
      .update(medicalCertificatesTable)
      .set({ ...certificateData, updatedAt: now })
      .where(eq(medicalCertificatesTable.id, existing.id));
  } else {
    await db.insert(medicalCertificatesTable).values({
      attendanceId,
      ...certificateData,
    });
  }

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}

// Salvar Resposta do Questionário (upsert)
export async function saveQuestionnaireResponse(
  attendanceId: string,
  questionnaireId: string,
  responseData: any,
) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    throw new Error("Não autorizado");
  }

  const doctorQuestionnaire =
    await db.query.doctorQuestionnairesTable.findFirst({
      where: eq(doctorQuestionnairesTable.id, questionnaireId),
    });

  if (!doctorQuestionnaire) {
    throw new Error("Questionário não encontrado");
  }

  const existing = await db.query.questionnaireResponsesTable.findFirst({
    where: and(
      eq(questionnaireResponsesTable.attendanceId, attendanceId),
      eq(questionnaireResponsesTable.doctorQuestionnaireId, questionnaireId),
    ),
  });

  if (existing) {
    await db
      .update(questionnaireResponsesTable)
      .set({
        responseData,
        updatedAt: new Date(),
      })
      .where(eq(questionnaireResponsesTable.id, existing.id));
  } else {
    await db.insert(questionnaireResponsesTable).values({
      attendanceId,
      doctorQuestionnaireId: questionnaireId,
      answeredBy: "doctor",
      responseData,
      completedAt: new Date(),
    });
  }

  revalidatePath(`/attendances/${attendanceId}`);
  return { success: true };
}
