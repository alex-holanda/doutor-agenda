import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  json,
  decimal,
  index,
} from "drizzle-orm/pg-core";

// =============================================
// ENUMS
// =============================================

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);
export const attendanceTypeEnum = pgEnum("attendance_type", [
  "scheduled",
  "walk_in",
  "emergency",
]);
export const attendanceStatusEnum = pgEnum("attendance_status", [
  "waiting",
  "in_progress",
  "completed",
  "cancelled",
  "no_show",
]);
export const fieldTypeEnum = pgEnum("field_type", [
  "text",
  "textarea",
  "number",
  "select",
  "multi_select",
  "radio",
  "checkbox",
  "date",
  "time",
  "boolean",
  "scale",
]);
export const prescriptionStatusEnum = pgEnum("prescription_status", [
  "draft",
  "finalized",
  "dispensed",
  "cancelled",
]);
export const userRoleEnum = pgEnum("user_role", [
  "super_admin",
  "admin",
  "doctor",
  "nurse",
  "receptionist",
]);

// =============================================
// USUÁRIOS E AUTENTICAÇÃO
// =============================================

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    stripeCustomerId: text("stripe_customer_id"),
    stripeSubscriptionId: text("stripe_subscription_id"),
    plan: text("plan"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [index("idx_users_email").on(table.email)],
);

export const sessionsTable = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
  },
  (table) => [
    index("idx_sessions_user_id").on(table.userId),
    index("idx_sessions_token").on(table.token),
  ],
);

export const accountsTable = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
  },
  (table) => [index("idx_accounts_user_id").on(table.userId)],
);

export const verificationsTable = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at"),
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("idx_verifications_identifier").on(table.identifier)],
);

// =============================================
// CLÍNICAS E USUÁRIOS
// =============================================

export const clinicsTable = pgTable(
  "clinics",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    cnpj: text("cnpj"),
    phone: text("phone"),
    email: text("email"),
    address: text("address"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_clinics_name").on(table.name)],
);

export const usersToClinicsTable = pgTable(
  "users_to_clinics",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    role: userRoleEnum("role").default("receptionist"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_users_to_clinics_user_id").on(table.userId),
    index("idx_users_to_clinics_clinic_id").on(table.clinicId),
    index("idx_users_to_clinics_unique").on(table.userId, table.clinicId),
  ],
);

// =============================================
// PROFISSIONAIS DE SAÚDE
// =============================================

export const professionalsTable = pgTable(
  "professionals",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => usersTable.id),
    name: text("name").notNull(),
    role: text("role").notNull(), // "doctor" | "nurse"
    registerNumber: text("register_number"), // CRM para médicos, COREN para enfermeiros
    phone: text("phone"),
    email: text("email"),
    avatarImageUrl: text("avatar_image_url"),
    specialty: text("specialty").notNull(), // especialidade médica ou função de enfermagem
    availableFromWeekDay: integer("available_from_week_day").notNull(),
    availableToWeekDay: integer("available_to_week_day").notNull(),
    availableFromTime: time("available_from_time").notNull(),
    availableToTime: time("available_to_time").notNull(),
    appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_professionals_clinic_id").on(table.clinicId),
    index("idx_professionals_user_id").on(table.userId),
    index("idx_professionals_role").on(table.role),
    index("idx_professionals_specialty").on(table.specialty),
  ],
);

export const patientsTable = pgTable(
  "patients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    cpf: text("cpf").unique(),
    rg: text("rg"),
    email: text("email").notNull(),
    phoneNumber: text("phone_number").notNull(),
    birthDate: timestamp("birth_date"),
    sex: patientSexEnum("sex").notNull(),
    address: text("address"),
    insurance: text("insurance"),
    insuranceNumber: text("insurance_number"),
    emergencyContact: text("emergency_contact"),
    emergencyPhone: text("emergency_phone"),
    notes: text("notes"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_patients_clinic_id").on(table.clinicId),
    index("idx_patients_name").on(table.name),
    index("idx_patients_cpf").on(table.cpf),
  ],
);

// =============================================
// AGENDAMENTOS E ATENDIMENTOS
// =============================================

export const appointmentsTable = pgTable(
  "appointments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    date: timestamp("date").notNull(),
    appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientsTable.id, { onDelete: "cascade" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => professionalsTable.id, { onDelete: "cascade" }),
    status: text("status").default("scheduled"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_appointments_date").on(table.date),
    index("idx_appointments_doctor_id").on(table.doctorId),
    index("idx_appointments_patient_id").on(table.patientId),
  ],
);

export const attendancesTable = pgTable(
  "attendances",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(
      () => appointmentsTable.id,
      {
        onDelete: "set null",
      },
    ),
    patientId: uuid("patient_id")
      .notNull()
      .references(() => patientsTable.id, { onDelete: "cascade" }),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => professionalsTable.id, { onDelete: "cascade" }),
    type: attendanceTypeEnum("type").notNull().default("scheduled"),
    status: attendanceStatusEnum("status").notNull().default("waiting"),
    scheduledStartTime: timestamp("scheduled_start_time"),
    actualStartTime: timestamp("actual_start_time"),
    actualEndTime: timestamp("actual_end_time"),
    chiefComplaint: text("chief_complaint"),
    notes: text("notes"),
    currentStep: integer("current_step").default(0),
    progressData: json("progress_data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_attendances_clinic_id").on(table.clinicId),
    index("idx_attendances_patient_id").on(table.patientId),
    index("idx_attendances_doctor_id").on(table.doctorId),
    index("idx_attendances_status").on(table.status),
  ],
);

// =============================================
// ATENDIMENTO ESTRUTURADO
// =============================================

export const vitalSignsTable = pgTable(
  "vital_signs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .notNull()
      .references(() => attendancesTable.id, { onDelete: "cascade" }),
    measuredAt: timestamp("measured_at").defaultNow().notNull(),
    measuredBy: text("measured_by").notNull(),
    bloodPressureSystolic: integer("blood_pressure_systolic"),
    bloodPressureDiastolic: integer("blood_pressure_diastolic"),
    heartRate: integer("heart_rate"),
    respiratoryRate: integer("respiratory_rate"),
    temperature: decimal("temperature", { precision: 4, scale: 1 }),
    oxygenSaturation: integer("oxygen_saturation"),
    bloodGlucose: integer("blood_glucose"),
    weight: decimal("weight", { precision: 5, scale: 2 }),
    height: decimal("height", { precision: 5, scale: 2 }),
    bmi: decimal("bmi", { precision: 4, scale: 1 }),
    abdominalCircumference: decimal("abdominal_circumference", {
      precision: 5,
      scale: 1,
    }),
    hipCircumference: decimal("hip_circumference", { precision: 5, scale: 1 }),
    waistHipRatio: decimal("waist_hip_ratio", { precision: 4, scale: 2 }),
    armCircumference: decimal("arm_circumference", { precision: 5, scale: 1 }),
    calfCircumference: decimal("calf_circumference", {
      precision: 5,
      scale: 1,
    }),
    painScale: integer("pain_scale"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_vital_signs_attendance_id").on(table.attendanceId)],
);

export const prescriptionsTable = pgTable(
  "prescriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .notNull()
      .references(() => attendancesTable.id, { onDelete: "cascade" }),
    appointmentId: uuid("appointment_id").references(
      () => appointmentsTable.id,
    ),
    status: prescriptionStatusEnum("status").default("finalized"),
    medications: text("medications"),
    exams: text("exams"),
    orientations: text("orientations"),
    returnDate: timestamp("return_date"),
    signedAt: timestamp("signed_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_prescriptions_attendance_id").on(table.attendanceId),
    index("idx_prescriptions_appointment_id").on(table.appointmentId),
  ],
);

export const medicalCertificatesTable = pgTable(
  "medical_certificates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .notNull()
      .references(() => attendancesTable.id, { onDelete: "cascade" }),
    days: integer("days").notNull().default(1),
    startDate: timestamp("start_date").defaultNow(),
    endDate: timestamp("end_date"),
    cidCode: text("cid_code"),
    cidDescription: text("cid_description"),
    recommendation: text("recommendation"),
    issuedAt: timestamp("issued_at").defaultNow(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_medical_certificates_attendance_id").on(table.attendanceId),
  ],
);

export const physicalExamsTable = pgTable(
  "physical_exams",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .notNull()
      .references(() => attendancesTable.id, { onDelete: "cascade" }),
    generalState: text("general_state"),
    consciousnessLevel: text("consciousness_level"),
    hydration: text("hydration"),
    skinColor: text("skin_color"),
    lungAuscultation: text("lung_auscultation"),
    heartAuscultation: text("heart_auscultation"),
    abdomen: text("abdomen"),
    extremities: text("extremities"),
    neurological: text("neurological"),
    observations: text("observations"),
    examinedAt: timestamp("examined_at").defaultNow(),
    examinedBy: text("examined_by"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_physical_exams_attendance_id").on(table.attendanceId)],
);

// =============================================
// SISTEMA DE QUESTIONÁRIOS
// =============================================

export const questionnaireFieldsTable = pgTable(
  "questionnaire_fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    fieldKey: text("field_key").notNull().unique(),
    fieldType: fieldTypeEnum("field_type").notNull(),
    description: text("description"),
    unit: text("unit"),
    minValue: integer("min_value"),
    maxValue: integer("max_value"),
    options: text("options").array(),
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    isRequired: boolean("is_required").default(false),
    isActive: boolean("is_active").default(true),
    order: integer("order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_questionnaire_fields_key").on(table.fieldKey)],
);

export const questionnaireTemplatesTable = pgTable(
  "questionnaire_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
      onDelete: "cascade",
    }),
    isActive: boolean("is_active").default(true),
    usageCount: integer("usage_count").default(0),
    version: integer("version").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_questionnaire_templates_clinic_id").on(table.clinicId),
  ],
);

export const questionnaireTemplateFieldsTable = pgTable(
  "questionnaire_template_fields",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => questionnaireTemplatesTable.id, {
        onDelete: "cascade",
      }),
    fieldId: uuid("field_id")
      .notNull()
      .references(() => questionnaireFieldsTable.id, { onDelete: "cascade" }),
    isRequired: boolean("is_required").default(false),
    order: integer("order").default(0),
    customLabel: text("custom_label"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_questionnaire_template_fields_template_id").on(table.templateId),
  ],
);

export const questionnairesTable = pgTable(
  "questionnaires",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    doctorId: uuid("doctor_id")
      .notNull()
      .references(() => professionalsTable.id, { onDelete: "cascade" }),
    templateId: uuid("template_id")
      .notNull()
      .references(() => questionnaireTemplatesTable.id, {
        onDelete: "cascade",
      }),
    name: text("name").notNull(),
    isActive: boolean("is_active").default(true),
    customizations: json("customizations"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("idx_questionnaires_doctor_id").on(table.doctorId)],
);

export const questionnaireResponsesTable = pgTable(
  "questionnaire_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    attendanceId: uuid("attendance_id")
      .notNull()
      .references(() => attendancesTable.id, { onDelete: "cascade" }),
    questionnaireId: uuid("questionnaire_id").references(
      () => questionnairesTable.id,
    ),
    answeredBy: text("answered_by").notNull(),
    answeredById: uuid("answered_by_id"),
    responseData: json("response_data").notNull(),
    completedAt: timestamp("completed_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    index("idx_questionnaire_responses_attendance_id").on(table.attendanceId),
    index("idx_questionnaire_responses_questionnaire_id").on(
      table.questionnaireId,
    ),
  ],
);

// =============================================
// PERMISSÕES
// =============================================

export const permissionsTable = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

export const rolePermissionsTable = pgTable(
  "role_permissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    role: userRoleEnum("role").notNull(),
    permissionId: uuid("permission_id").references(() => permissionsTable.id),
  },
  (table) => [index("idx_role_permissions_role").on(table.role)],
);

// =============================================
// RELAÇÕES
// =============================================

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
  professionals: many(professionalsTable),
}));

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  professionals: many(professionalsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
  attendances: many(attendancesTable),
  questionnaireTemplates: many(questionnaireTemplatesTable),
}));

export const professionalsTableRelations = relations(
  professionalsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [professionalsTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTable, {
      fields: [professionalsTable.userId],
      references: [usersTable.id],
    }),
    appointments: many(appointmentsTable),
    attendances: many(attendancesTable),
    questionnaires: many(questionnairesTable),
  }),
);

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    attendances: many(attendancesTable),
  }),
);

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(professionalsTable, {
      fields: [appointmentsTable.doctorId],
      references: [professionalsTable.id],
    }),
    attendance: one(attendancesTable, {
      fields: [appointmentsTable.id],
      references: [attendancesTable.appointmentId],
    }),
  }),
);

export const attendancesTableRelations = relations(
  attendancesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [attendancesTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [attendancesTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [attendancesTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(professionalsTable, {
      fields: [attendancesTable.doctorId],
      references: [professionalsTable.id],
    }),
    vitalSigns: many(vitalSignsTable),
    prescriptions: many(prescriptionsTable),
    medicalCertificates: many(medicalCertificatesTable),
    physicalExams: many(physicalExamsTable),
    questionnaireResponses: many(questionnaireResponsesTable),
  }),
);

export const vitalSignsTableRelations = relations(
  vitalSignsTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [vitalSignsTable.attendanceId],
      references: [attendancesTable.id],
    }),
  }),
);

export const prescriptionsTableRelations = relations(
  prescriptionsTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [prescriptionsTable.attendanceId],
      references: [attendancesTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [prescriptionsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
  }),
);

export const medicalCertificatesTableRelations = relations(
  medicalCertificatesTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [medicalCertificatesTable.attendanceId],
      references: [attendancesTable.id],
    }),
  }),
);

export const physicalExamsTableRelations = relations(
  physicalExamsTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [physicalExamsTable.attendanceId],
      references: [attendancesTable.id],
    }),
  }),
);

export const questionnaireFieldsTableRelations = relations(
  questionnaireFieldsTable,
  ({ many }) => ({
    templateFields: many(questionnaireTemplateFieldsTable),
  }),
);

export const questionnaireTemplatesTableRelations = relations(
  questionnaireTemplatesTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [questionnaireTemplatesTable.clinicId],
      references: [clinicsTable.id],
    }),
    templateFields: many(questionnaireTemplateFieldsTable),
    questionnaires: many(questionnairesTable),
  }),
);

export const questionnaireTemplateFieldsTableRelations = relations(
  questionnaireTemplateFieldsTable,
  ({ one }) => ({
    template: one(questionnaireTemplatesTable, {
      fields: [questionnaireTemplateFieldsTable.templateId],
      references: [questionnaireTemplatesTable.id],
    }),
    field: one(questionnaireFieldsTable, {
      fields: [questionnaireTemplateFieldsTable.fieldId],
      references: [questionnaireFieldsTable.id],
    }),
  }),
);

export const questionnairesTableRelations = relations(
  questionnairesTable,
  ({ one, many }) => ({
    doctor: one(professionalsTable, {
      fields: [questionnairesTable.doctorId],
      references: [professionalsTable.id],
    }),
    template: one(questionnaireTemplatesTable, {
      fields: [questionnairesTable.templateId],
      references: [questionnaireTemplatesTable.id],
    }),
    responses: many(questionnaireResponsesTable),
  }),
);

export const questionnaireResponsesTableRelations = relations(
  questionnaireResponsesTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [questionnaireResponsesTable.attendanceId],
      references: [attendancesTable.id],
    }),
    questionnaire: one(questionnairesTable, {
      fields: [questionnaireResponsesTable.questionnaireId],
      references: [questionnairesTable.id],
    }),
  }),
);
