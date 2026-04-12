CREATE TYPE "public"."attendance_status" AS ENUM('waiting', 'in_progress', 'completed', 'cancelled', 'no_show');--> statement-breakpoint
CREATE TYPE "public"."attendance_type" AS ENUM('scheduled', 'walk_in', 'emergency');--> statement-breakpoint
CREATE TYPE "public"."field_type" AS ENUM('text', 'textarea', 'number', 'select', 'multi_select', 'radio', 'checkbox', 'date', 'time', 'boolean', 'scale');--> statement-breakpoint
CREATE TYPE "public"."patient_sex" AS ENUM('male', 'female');--> statement-breakpoint
CREATE TYPE "public"."prescription_status" AS ENUM('draft', 'finalized', 'dispensed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."questionnaire_category" AS ENUM('system', 'clinic', 'personal');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"scope" text,
	"password" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"date" timestamp NOT NULL,
	"appointment_price_in_cents" integer NOT NULL,
	"clinic_id" uuid NOT NULL,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"status" text DEFAULT 'scheduled',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"appointment_id" uuid,
	"patient_id" uuid NOT NULL,
	"doctor_id" uuid NOT NULL,
	"type" "attendance_type" DEFAULT 'scheduled' NOT NULL,
	"status" "attendance_status" DEFAULT 'waiting' NOT NULL,
	"scheduled_start_time" timestamp,
	"actual_start_time" timestamp,
	"actual_end_time" timestamp,
	"chief_complaint" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "clinics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"cnpj" text,
	"phone" text,
	"email" text,
	"address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "clinics_cnpj_unique" UNIQUE("cnpj")
);
--> statement-breakpoint
CREATE TABLE "doctor_questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"doctor_id" uuid NOT NULL,
	"template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"customizations" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "doctors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"user_id" text,
	"name" text NOT NULL,
	"crm" text,
	"phone" text,
	"email" text,
	"avatar_image_url" text,
	"specialty" text NOT NULL,
	"available_from_week_day" integer NOT NULL,
	"available_to_week_day" integer NOT NULL,
	"available_from_time" time NOT NULL,
	"available_to_time" time NOT NULL,
	"appointment_price_in_cents" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "medical_certificates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"days" integer DEFAULT 1 NOT NULL,
	"start_date" timestamp DEFAULT now(),
	"end_date" timestamp,
	"cid_code" text,
	"cid_description" text,
	"recommendation" text,
	"issued_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cpf" text,
	"rg" text,
	"email" text NOT NULL,
	"phone_number" text NOT NULL,
	"birth_date" timestamp,
	"sex" "patient_sex" NOT NULL,
	"address" text,
	"insurance" text,
	"insurance_number" text,
	"emergency_contact" text,
	"emergency_phone" text,
	"notes" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "patients_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "physical_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"general_state" text,
	"consciousness_level" text,
	"hydration" text,
	"skin_color" text,
	"lung_auscultation" text,
	"heart_auscultation" text,
	"abdomen" text,
	"extremities" text,
	"neurological" text,
	"observations" text,
	"examined_at" timestamp DEFAULT now(),
	"examined_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "prescriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"status" "prescription_status" DEFAULT 'finalized',
	"medications" text NOT NULL,
	"exams" text,
	"orientations" text,
	"return_date" timestamp,
	"signed_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "question_fields_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"field_key" text NOT NULL,
	"field_type" "field_type" NOT NULL,
	"category" text NOT NULL,
	"description" text,
	"unit" text,
	"min_value" integer,
	"max_value" integer,
	"options" text[],
	"placeholder" text,
	"help_text" text,
	"is_required" boolean DEFAULT false,
	"is_active" boolean DEFAULT true,
	"is_system" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "question_fields_catalog_field_key_unique" UNIQUE("field_key")
);
--> statement-breakpoint
CREATE TABLE "questionnaire_responses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"doctor_questionnaire_id" uuid NOT NULL,
	"answered_by" text NOT NULL,
	"answered_by_id" uuid,
	"response_data" json NOT NULL,
	"completed_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questionnaire_template_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"field_id" uuid NOT NULL,
	"is_required" boolean DEFAULT false,
	"order" integer DEFAULT 0,
	"custom_label" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questionnaire_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"category_type" "questionnaire_category" DEFAULT 'system',
	"clinic_id" uuid,
	"doctor_id" uuid,
	"is_active" boolean DEFAULT true,
	"is_system" boolean DEFAULT false,
	"usage_count" integer DEFAULT 0,
	"version" integer DEFAULT 1,
	"parent_template_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean NOT NULL,
	"image" text,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"plan" text,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "users_to_clinics" (
	"user_id" text NOT NULL,
	"clinic_id" uuid NOT NULL,
	"role" text DEFAULT 'member',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp,
	"updated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "vital_signs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attendance_id" uuid NOT NULL,
	"measured_at" timestamp DEFAULT now() NOT NULL,
	"measured_by" text NOT NULL,
	"blood_pressure_systolic" integer,
	"blood_pressure_diastolic" integer,
	"heart_rate" integer,
	"respiratory_rate" integer,
	"temperature" numeric(4, 1),
	"oxygen_saturation" integer,
	"blood_glucose" integer,
	"weight" numeric(5, 2),
	"height" numeric(5, 2),
	"bmi" numeric(4, 1),
	"pain_scale" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_questionnaires" ADD CONSTRAINT "doctor_questionnaires_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_questionnaires" ADD CONSTRAINT "doctor_questionnaires_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "medical_certificates" ADD CONSTRAINT "medical_certificates_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_exams" ADD CONSTRAINT "physical_exams_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prescriptions" ADD CONSTRAINT "prescriptions_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_doctor_questionnaire_id_doctor_questionnaires_id_fk" FOREIGN KEY ("doctor_questionnaire_id") REFERENCES "public"."doctor_questionnaires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_template_fields" ADD CONSTRAINT "questionnaire_template_fields_template_id_questionnaire_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."questionnaire_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_template_fields" ADD CONSTRAINT "questionnaire_template_fields_field_id_question_fields_catalog_id_fk" FOREIGN KEY ("field_id") REFERENCES "public"."question_fields_catalog"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_templates" ADD CONSTRAINT "questionnaire_templates_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_templates" ADD CONSTRAINT "questionnaire_templates_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_clinics" ADD CONSTRAINT "users_to_clinics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users_to_clinics" ADD CONSTRAINT "users_to_clinics_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_attendance_id_attendances_id_fk" FOREIGN KEY ("attendance_id") REFERENCES "public"."attendances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_accounts_user_id" ON "accounts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_provider_id" ON "accounts" USING btree ("provider_id");--> statement-breakpoint
CREATE INDEX "idx_accounts_account_id" ON "accounts" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_date" ON "appointments" USING btree ("date");--> statement-breakpoint
CREATE INDEX "idx_appointments_clinic_id" ON "appointments" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_id" ON "appointments" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_doctor_id" ON "appointments" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_appointments_status" ON "appointments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_appointments_doctor_date" ON "appointments" USING btree ("doctor_id","date");--> statement-breakpoint
CREATE INDEX "idx_appointments_patient_date" ON "appointments" USING btree ("patient_id","date");--> statement-breakpoint
CREATE INDEX "idx_attendances_clinic_id" ON "attendances" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_attendances_patient_id" ON "attendances" USING btree ("patient_id");--> statement-breakpoint
CREATE INDEX "idx_attendances_doctor_id" ON "attendances" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_attendances_appointment_id" ON "attendances" USING btree ("appointment_id");--> statement-breakpoint
CREATE INDEX "idx_attendances_status" ON "attendances" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_attendances_type" ON "attendances" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_attendances_actual_start_time" ON "attendances" USING btree ("actual_start_time");--> statement-breakpoint
CREATE INDEX "idx_attendances_doctor_status" ON "attendances" USING btree ("doctor_id","status");--> statement-breakpoint
CREATE INDEX "idx_attendances_patient_status" ON "attendances" USING btree ("patient_id","status");--> statement-breakpoint
CREATE INDEX "idx_clinics_name" ON "clinics" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_clinics_cnpj" ON "clinics" USING btree ("cnpj");--> statement-breakpoint
CREATE INDEX "idx_clinics_email" ON "clinics" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_doctor_questionnaires_doctor_id" ON "doctor_questionnaires" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_doctor_questionnaires_template_id" ON "doctor_questionnaires" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_doctor_questionnaires_is_active" ON "doctor_questionnaires" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_doctors_clinic_id" ON "doctors" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_doctors_user_id" ON "doctors" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_doctors_specialty" ON "doctors" USING btree ("specialty");--> statement-breakpoint
CREATE INDEX "idx_doctors_crm" ON "doctors" USING btree ("crm");--> statement-breakpoint
CREATE INDEX "idx_doctors_email" ON "doctors" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_doctors_is_active" ON "doctors" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_medical_certificates_attendance_id" ON "medical_certificates" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "idx_medical_certificates_cid_code" ON "medical_certificates" USING btree ("cid_code");--> statement-breakpoint
CREATE INDEX "idx_medical_certificates_issued_at" ON "medical_certificates" USING btree ("issued_at");--> statement-breakpoint
CREATE INDEX "idx_patients_clinic_id" ON "patients" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_patients_name" ON "patients" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_patients_cpf" ON "patients" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "idx_patients_email" ON "patients" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_patients_phone_number" ON "patients" USING btree ("phone_number");--> statement-breakpoint
CREATE INDEX "idx_patients_birth_date" ON "patients" USING btree ("birth_date");--> statement-breakpoint
CREATE INDEX "idx_patients_insurance" ON "patients" USING btree ("insurance");--> statement-breakpoint
CREATE INDEX "idx_patients_is_active" ON "patients" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_physical_exams_attendance_id" ON "physical_exams" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "idx_physical_exams_examined_at" ON "physical_exams" USING btree ("examined_at");--> statement-breakpoint
CREATE INDEX "idx_physical_exams_examined_by" ON "physical_exams" USING btree ("examined_by");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_attendance_id" ON "prescriptions" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_status" ON "prescriptions" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_prescriptions_return_date" ON "prescriptions" USING btree ("return_date");--> statement-breakpoint
CREATE INDEX "idx_question_fields_category" ON "question_fields_catalog" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_question_fields_field_type" ON "question_fields_catalog" USING btree ("field_type");--> statement-breakpoint
CREATE INDEX "idx_question_fields_is_active" ON "question_fields_catalog" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_question_fields_field_key" ON "question_fields_catalog" USING btree ("field_key");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_responses_attendance_id" ON "questionnaire_responses" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_responses_doctor_questionnaire_id" ON "questionnaire_responses" USING btree ("doctor_questionnaire_id");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_responses_answered_by" ON "questionnaire_responses" USING btree ("answered_by");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_responses_completed_at" ON "questionnaire_responses" USING btree ("completed_at");--> statement-breakpoint
CREATE INDEX "idx_template_fields_template_id" ON "questionnaire_template_fields" USING btree ("template_id");--> statement-breakpoint
CREATE INDEX "idx_template_fields_field_id" ON "questionnaire_template_fields" USING btree ("field_id");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_templates_category" ON "questionnaire_templates" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_templates_category_type" ON "questionnaire_templates" USING btree ("category_type");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_templates_clinic_id" ON "questionnaire_templates" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_templates_doctor_id" ON "questionnaire_templates" USING btree ("doctor_id");--> statement-breakpoint
CREATE INDEX "idx_questionnaire_templates_is_active" ON "questionnaire_templates" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_sessions_user_id" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_sessions_token" ON "sessions" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_sessions_expires_at" ON "sessions" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_stripe_customer_id" ON "users" USING btree ("stripe_customer_id");--> statement-breakpoint
CREATE INDEX "idx_users_plan" ON "users" USING btree ("plan");--> statement-breakpoint
CREATE INDEX "idx_users_created_at" ON "users" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_users_to_clinics_user_id" ON "users_to_clinics" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_users_to_clinics_clinic_id" ON "users_to_clinics" USING btree ("clinic_id");--> statement-breakpoint
CREATE INDEX "idx_users_to_clinics_unique" ON "users_to_clinics" USING btree ("user_id","clinic_id");--> statement-breakpoint
CREATE INDEX "idx_users_to_clinics_role" ON "users_to_clinics" USING btree ("role");--> statement-breakpoint
CREATE INDEX "idx_verifications_identifier" ON "verifications" USING btree ("identifier");--> statement-breakpoint
CREATE INDEX "idx_verifications_expires_at" ON "verifications" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_vital_signs_attendance_id" ON "vital_signs" USING btree ("attendance_id");--> statement-breakpoint
CREATE INDEX "idx_vital_signs_measured_at" ON "vital_signs" USING btree ("measured_at");--> statement-breakpoint
CREATE INDEX "idx_vital_signs_measured_by" ON "vital_signs" USING btree ("measured_by");