CREATE TABLE "questionnaire_fields" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"questionnaire_id" uuid NOT NULL,
	"label" text NOT NULL,
	"field_key" text NOT NULL,
	"field_type" "field_type" NOT NULL,
	"placeholder" text,
	"help_text" text,
	"is_required" boolean DEFAULT false,
	"options" text[],
	"min_value" integer,
	"max_value" integer,
	"regex_pattern" text,
	"order" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "questionnaires" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clinic_id" uuid NOT NULL,
	"name" text NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "clinics" DROP CONSTRAINT "clinics_cnpj_unique";--> statement-breakpoint
ALTER TABLE "questionnaire_responses" DROP CONSTRAINT "questionnaire_responses_doctor_questionnaire_id_doctor_questionnaires_id_fk";
--> statement-breakpoint
DROP INDEX "idx_accounts_user_id";--> statement-breakpoint
DROP INDEX "idx_accounts_provider_id";--> statement-breakpoint
DROP INDEX "idx_accounts_account_id";--> statement-breakpoint
DROP INDEX "idx_appointments_date";--> statement-breakpoint
DROP INDEX "idx_appointments_clinic_id";--> statement-breakpoint
DROP INDEX "idx_appointments_patient_id";--> statement-breakpoint
DROP INDEX "idx_appointments_doctor_id";--> statement-breakpoint
DROP INDEX "idx_appointments_status";--> statement-breakpoint
DROP INDEX "idx_appointments_doctor_date";--> statement-breakpoint
DROP INDEX "idx_appointments_patient_date";--> statement-breakpoint
DROP INDEX "idx_attendances_clinic_id";--> statement-breakpoint
DROP INDEX "idx_attendances_patient_id";--> statement-breakpoint
DROP INDEX "idx_attendances_doctor_id";--> statement-breakpoint
DROP INDEX "idx_attendances_appointment_id";--> statement-breakpoint
DROP INDEX "idx_attendances_status";--> statement-breakpoint
DROP INDEX "idx_attendances_type";--> statement-breakpoint
DROP INDEX "idx_attendances_actual_start_time";--> statement-breakpoint
DROP INDEX "idx_attendances_doctor_status";--> statement-breakpoint
DROP INDEX "idx_attendances_patient_status";--> statement-breakpoint
DROP INDEX "idx_clinics_name";--> statement-breakpoint
DROP INDEX "idx_clinics_cnpj";--> statement-breakpoint
DROP INDEX "idx_clinics_email";--> statement-breakpoint
DROP INDEX "idx_doctor_questionnaires_doctor_id";--> statement-breakpoint
DROP INDEX "idx_doctor_questionnaires_template_id";--> statement-breakpoint
DROP INDEX "idx_doctor_questionnaires_is_active";--> statement-breakpoint
DROP INDEX "idx_doctors_clinic_id";--> statement-breakpoint
DROP INDEX "idx_doctors_user_id";--> statement-breakpoint
DROP INDEX "idx_doctors_specialty";--> statement-breakpoint
DROP INDEX "idx_doctors_crm";--> statement-breakpoint
DROP INDEX "idx_doctors_email";--> statement-breakpoint
DROP INDEX "idx_doctors_is_active";--> statement-breakpoint
DROP INDEX "idx_medical_certificates_attendance_id";--> statement-breakpoint
DROP INDEX "idx_medical_certificates_cid_code";--> statement-breakpoint
DROP INDEX "idx_medical_certificates_issued_at";--> statement-breakpoint
DROP INDEX "idx_patients_clinic_id";--> statement-breakpoint
DROP INDEX "idx_patients_name";--> statement-breakpoint
DROP INDEX "idx_patients_cpf";--> statement-breakpoint
DROP INDEX "idx_patients_email";--> statement-breakpoint
DROP INDEX "idx_patients_phone_number";--> statement-breakpoint
DROP INDEX "idx_patients_birth_date";--> statement-breakpoint
DROP INDEX "idx_patients_insurance";--> statement-breakpoint
DROP INDEX "idx_patients_is_active";--> statement-breakpoint
DROP INDEX "idx_physical_exams_attendance_id";--> statement-breakpoint
DROP INDEX "idx_physical_exams_examined_at";--> statement-breakpoint
DROP INDEX "idx_physical_exams_examined_by";--> statement-breakpoint
DROP INDEX "idx_prescriptions_attendance_id";--> statement-breakpoint
DROP INDEX "idx_prescriptions_status";--> statement-breakpoint
DROP INDEX "idx_prescriptions_return_date";--> statement-breakpoint
DROP INDEX "idx_question_fields_category";--> statement-breakpoint
DROP INDEX "idx_question_fields_field_type";--> statement-breakpoint
DROP INDEX "idx_question_fields_is_active";--> statement-breakpoint
DROP INDEX "idx_question_fields_field_key";--> statement-breakpoint
DROP INDEX "idx_questionnaire_responses_attendance_id";--> statement-breakpoint
DROP INDEX "idx_questionnaire_responses_doctor_questionnaire_id";--> statement-breakpoint
DROP INDEX "idx_questionnaire_responses_answered_by";--> statement-breakpoint
DROP INDEX "idx_questionnaire_responses_completed_at";--> statement-breakpoint
DROP INDEX "idx_template_fields_template_id";--> statement-breakpoint
DROP INDEX "idx_template_fields_field_id";--> statement-breakpoint
DROP INDEX "idx_questionnaire_templates_category";--> statement-breakpoint
DROP INDEX "idx_questionnaire_templates_category_type";--> statement-breakpoint
DROP INDEX "idx_questionnaire_templates_clinic_id";--> statement-breakpoint
DROP INDEX "idx_questionnaire_templates_doctor_id";--> statement-breakpoint
DROP INDEX "idx_questionnaire_templates_is_active";--> statement-breakpoint
DROP INDEX "idx_sessions_user_id";--> statement-breakpoint
DROP INDEX "idx_sessions_token";--> statement-breakpoint
DROP INDEX "idx_sessions_expires_at";--> statement-breakpoint
DROP INDEX "idx_users_email";--> statement-breakpoint
DROP INDEX "idx_users_stripe_customer_id";--> statement-breakpoint
DROP INDEX "idx_users_plan";--> statement-breakpoint
DROP INDEX "idx_users_created_at";--> statement-breakpoint
DROP INDEX "idx_users_to_clinics_user_id";--> statement-breakpoint
DROP INDEX "idx_users_to_clinics_clinic_id";--> statement-breakpoint
DROP INDEX "idx_users_to_clinics_unique";--> statement-breakpoint
DROP INDEX "idx_users_to_clinics_role";--> statement-breakpoint
DROP INDEX "idx_verifications_identifier";--> statement-breakpoint
DROP INDEX "idx_verifications_expires_at";--> statement-breakpoint
DROP INDEX "idx_vital_signs_attendance_id";--> statement-breakpoint
DROP INDEX "idx_vital_signs_measured_at";--> statement-breakpoint
DROP INDEX "idx_vital_signs_measured_by";--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ALTER COLUMN "doctor_questionnaire_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD COLUMN "questionnaire_id" uuid;--> statement-breakpoint
ALTER TABLE "questionnaire_fields" ADD CONSTRAINT "questionnaire_fields_questionnaire_id_questionnaires_id_fk" FOREIGN KEY ("questionnaire_id") REFERENCES "public"."questionnaires"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaires" ADD CONSTRAINT "questionnaires_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questionnaire_responses" ADD CONSTRAINT "questionnaire_responses_doctor_questionnaire_id_doctor_questionnaires_id_fk" FOREIGN KEY ("doctor_questionnaire_id") REFERENCES "public"."doctor_questionnaires"("id") ON DELETE no action ON UPDATE no action;