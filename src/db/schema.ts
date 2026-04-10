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
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
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
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
}));

export const sessionsTable = pgTable("sessions", {
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
});

export const accountsTable = pgTable("accounts", {
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
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  // 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 0 - Sunday
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sex: patientSexEnum("sex").notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
  }),
);

export const appointmentsTable = pgTable("appointments", {
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
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

export const ateendanceTypeEnum = pgEnum("attendance_type", [
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

export const attendancesTable = pgTable("attendances", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(() => appointmentsTable.id, {
    onDelete: "cascade",
  }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  type: ateendanceTypeEnum("type").notNull().default("scheduled"),
  status: attendanceStatusEnum("status").notNull().default("waiting"),
  scheduledStartTime: timestamp("scheduled_start_time"),
  actualStartTime: timestamp("actual_start_time"),
  actualEndTime: timestamp("actual_end_time"),
  chiefComplaint: text("chief_complaint"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const questionnairesTable = pgTable("questionnaires", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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

export const questionnaireFieldsTable = pgTable("questionnaire_fields", {
  id: uuid("id").defaultRandom().primaryKey(),
  questionnaireId: uuid("questionnaire_id")
    .notNull()
    .references(() => questionnairesTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  fieldKey: text("field_key").notNull(),
  fieldType: fieldTypeEnum("field_type").notNull(),
  placeholder: text("placeholder"),
  helpText: text("help_text"),
  isRequired: boolean("is_required").default(false),
  options: text("options").array(),
  minValue: integer("min_value"),
  maxValue: integer("max_value"),
  regexPattern: text("regex_pattern"),
  order: integer("order").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const questionnaireResponsesTable = pgTable("questionnaire_responses", {
  id: uuid("id").defaultRandom().primaryKey(),
  attendanceId: uuid("attendance_id")
    .notNull()
    .references(() => attendancesTable.id, { onDelete: "cascade" }),
  questionnaireId: uuid("questionnaire_id")
    .notNull()
    .references(() => questionnairesTable.id, { onDelete: "cascade" }),
  answeredBy: text("answered_by").notNull(),
  answeredById: text("answered_by_id"),
  responseData: json("response_data").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const vitalSignsTable = pgTable("vital_signs", {
  id: uuid("id").defaultRandom().primaryKey(),
  attendanceId: uuid("attendance_id")
    .notNull()
    .references(() => attendancesTable.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at").notNull(),
  measuredBy: text("measured_by").notNull(),
  bloodPressureSystolic: integer("blood_pressure_systolic"),
  bloodPressureDiastolic: integer("blood_pressure_diastolic"),
  heartRate: integer("heart_rate"),
  respiratoryRate: integer("oxygen_saturation"),
  bloodGlucose: integer("blood_glucose"),
  weight: integer("weight"),
  height: integer("height"),
  bmi: integer("bmi"),
  painScale: integer("pain_scale"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

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
    doctor: one(doctorsTable, {
      fields: [attendancesTable.doctorId],
      references: [doctorsTable.id],
    }),
    responses: many(questionnaireResponsesTable),
    vitalSigns: many(vitalSignsTable),
  }),
);

export const questionnairesTableRelations = relations(
  questionnairesTable,
  ({ many }) => ({
    fields: many(questionnaireFieldsTable),
    responses: many(questionnaireResponsesTable),
  }),
);

export const questionnaireFieldsTableRelations = relations(
  questionnaireFieldsTable,
  ({ one }) => ({
    questionnaire: one(questionnaireFieldsTable, {
      fields: [questionnaireFieldsTable.questionnaireId],
      references: [questionnaireFieldsTable.id],
    }),
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

export const vitalSignsTableRelations = relations(
  vitalSignsTable,
  ({ one }) => ({
    attendance: one(attendancesTable, {
      fields: [vitalSignsTable.attendanceId],
      references: [attendancesTable.id],
    }),
  }),
);
