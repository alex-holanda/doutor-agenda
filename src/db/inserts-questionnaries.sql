-- Primeiro, busque o ID de uma clínica existente
-- SELECT id FROM clinics LIMIT 1;

-- Substitua (SELECT id FROM clinics LIMIT 1) pelo UUID real da clínica
-- Exemplo: '123e4567-e89b-12d3-a456-426614174000'

-- =====================================================
-- 1. Questionário de Anamnese
-- =====================================================

INSERT INTO questionnaires (id, clinic_id, name, category, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM clinics LIMIT 1), 'Anamnese Geral', 'anamnesis', true, NOW(), NOW());

-- Inserir campos da Anamnese
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Queixa principal', 
  'chief_complaint', 
  'textarea', 
  'Descreva o motivo da consulta...', 
  NULL, 
  true, 
  1, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'História da doença atual', 
  'history_of_current_illness', 
  'textarea', 
  'Descreva o histórico da doença atual...', 
  NULL, 
  true, 
  2, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Antecedentes pessoais', 
  'personal_history', 
  'textarea', 
  'Hipertensão, diabetes, cirurgias, etc...', 
  NULL, 
  false, 
  3, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Antecedentes familiares', 
  'family_history', 
  'textarea', 
  'Histórico de doenças na família...', 
  NULL, 
  false, 
  4, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Alergias', 
  'allergies', 
  'text', 
  'Medicamentos, alimentos, etc...', 
  NULL, 
  false, 
  5, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Medicações em uso', 
  'medications', 
  'textarea', 
  'Liste os medicamentos que o paciente utiliza...', 
  NULL, 
  false, 
  6, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Hábitos de vida', 
  'lifestyle_habits', 
  'multi_select', 
  NULL, 
  'Selecione os hábitos', 
  false, 
  7, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atualizar opções do campo 'Hábitos de vida'
UPDATE questionnaire_fields 
SET options = ARRAY['Tabagismo', 'Etilismo', 'Atividade física', 'Sedentarismo']
WHERE field_key = 'lifestyle_habits' 
  AND questionnaire_id IN (SELECT id FROM questionnaires WHERE name = 'Anamnese Geral' AND clinic_id = (SELECT id FROM clinics LIMIT 1));

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Fuma?', 
  'smoking', 
  'boolean', 
  NULL, 
  NULL, 
  false, 
  8, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Quantidade de cigarros/dia', 
  'cigarettes_per_day', 
  'number', 
  'Quantidade', 
  NULL, 
  false, 
  0, 
  100, 
  9, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Bebe?', 
  'alcohol', 
  'boolean', 
  NULL, 
  NULL, 
  false, 
  10, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Anamnese Geral' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- =====================================================
-- 2. Questionário de Sinais Vitais
-- =====================================================

INSERT INTO questionnaires (id, clinic_id, name, category, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM clinics LIMIT 1), 'Sinais Vitais', 'vital_signs', true, NOW(), NOW());

-- Pressão arterial (sistólica)
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Pressão arterial (sistólica)', 
  'blood_pressure_systolic', 
  'number', 
  'mmHg', 
  'Ex: 120', 
  true, 
  0, 
  300, 
  1, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Pressão arterial (diastólica)
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Pressão arterial (diastólica)', 
  'blood_pressure_diastolic', 
  'number', 
  'mmHg', 
  'Ex: 80', 
  true, 
  0, 
  200, 
  2, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Frequência cardíaca
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Frequência cardíaca', 
  'heart_rate', 
  'number', 
  'bpm', 
  'Batimentos por minuto', 
  true, 
  0, 
  300, 
  3, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Frequência respiratória
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Frequência respiratória', 
  'respiratory_rate', 
  'number', 
  'rpm', 
  'Respirações por minuto', 
  false, 
  0, 
  100, 
  4, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Temperatura
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Temperatura', 
  'temperature', 
  'number', 
  '°C', 
  'Temperatura corporal em graus Celsius', 
  false, 
  30, 
  45, 
  5, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Saturação de oxigênio
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Saturação de oxigênio', 
  'oxygen_saturation', 
  'number', 
  '%', 
  'Saturação de O2 no sangue', 
  false, 
  0, 
  100, 
  6, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Glicemia
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Glicemia', 
  'blood_glucose', 
  'number', 
  'mg/dL', 
  NULL, 
  false, 
  0, 
  600, 
  7, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Peso
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Peso', 
  'weight', 
  'number', 
  'kg', 
  NULL, 
  false, 
  0, 
  500, 
  8, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Altura
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Altura', 
  'height', 
  'number', 
  'cm', 
  NULL, 
  false, 
  0, 
  300, 
  9, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- IMC
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'IMC', 
  'bmi', 
  'number', 
  'kg/m²', 
  'Calculado automaticamente', 
  false, 
  0, 
  100, 
  10, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Escala de dor
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Escala de dor', 
  'pain_scale', 
  'scale', 
  '0 - Sem dor, 10 - Pior dor possível', 
  NULL, 
  true, 
  0, 
  10, 
  11, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Sinais Vitais' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- =====================================================
-- 3. Questionário de Exame Físico
-- =====================================================

INSERT INTO questionnaires (id, clinic_id, name, category, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM clinics LIMIT 1), 'Exame Físico', 'physical_exam', true, NOW(), NOW());

-- Estado geral
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Estado geral', 
  'general_state', 
  'select', 
  NULL, 
  NULL, 
  true, 
  1, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atualizar opções do campo 'Estado geral'
UPDATE questionnaire_fields 
SET options = ARRAY['Bom', 'Regular', 'Ruim']
WHERE field_key = 'general_state' 
  AND questionnaire_id IN (SELECT id FROM questionnaires WHERE name = 'Exame Físico' AND clinic_id = (SELECT id FROM clinics LIMIT 1));

-- Nível de consciência
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Nível de consciência', 
  'consciousness_level', 
  'select', 
  NULL, 
  NULL, 
  false, 
  2, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atualizar opções do campo 'Nível de consciência'
UPDATE questionnaire_fields 
SET options = ARRAY['Consciente', 'Sonolento', 'Confuso', 'Inconsciente']
WHERE field_key = 'consciousness_level' 
  AND questionnaire_id IN (SELECT id FROM questionnaires WHERE name = 'Exame Físico' AND clinic_id = (SELECT id FROM clinics LIMIT 1));

-- Hidratação
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Hidratação', 
  'hydration', 
  'select', 
  NULL, 
  NULL, 
  false, 
  3, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atualizar opções do campo 'Hidratação'
UPDATE questionnaire_fields 
SET options = ARRAY['Hidratado', 'Desidratado leve', 'Desidratado moderado', 'Desidratado grave']
WHERE field_key = 'hydration' 
  AND questionnaire_id IN (SELECT id FROM questionnaires WHERE name = 'Exame Físico' AND clinic_id = (SELECT id FROM clinics LIMIT 1));

-- Coloração da pele
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Coloração da pele', 
  'skin_color', 
  'select', 
  NULL, 
  NULL, 
  false, 
  4, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atualizar opções do campo 'Coloração da pele'
UPDATE questionnaire_fields 
SET options = ARRAY['Normal', 'Pálida', 'Ictérica', 'Cianótica', 'Avermelhada']
WHERE field_key = 'skin_color' 
  AND questionnaire_id IN (SELECT id FROM questionnaires WHERE name = 'Exame Físico' AND clinic_id = (SELECT id FROM clinics LIMIT 1));

-- Achados na ausculta pulmonar
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Achados na ausculta pulmonar', 
  'lung_auscultation', 
  'textarea', 
  'Descreva os achados...', 
  NULL, 
  false, 
  5, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Achados na ausculta cardíaca
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Achados na ausculta cardíaca', 
  'heart_auscultation', 
  'textarea', 
  'Descreva os achados...', 
  NULL, 
  false, 
  6, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Abdome
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Abdome', 
  'abdomen', 
  'textarea', 
  'Descreva o exame do abdome...', 
  NULL, 
  false, 
  7, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Extremidades
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Extremidades', 
  'extremities', 
  'textarea', 
  'Descreva o exame das extremidades...', 
  NULL, 
  false, 
  8, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Exame Físico' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);


-- =====================================================
-- 4. Questionário de Prescrição Médica
-- =====================================================

INSERT INTO questionnaires (id, clinic_id, name, category, is_active, created_at, updated_at)
VALUES (gen_random_uuid(), (SELECT id FROM clinics LIMIT 1), 'Prescrição Médica', 'prescription', true, NOW(), NOW());

-- Medicamentos prescritos
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Medicamentos prescritos', 
  'medications_prescribed', 
  'textarea', 
  'Liste os medicamentos, dosagens e horários...', 
  NULL, 
  true, 
  1, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Exames solicitados
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Exames solicitados', 
  'requested_exams', 
  'textarea', 
  'Liste os exames solicitados...', 
  NULL, 
  false, 
  2, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Orientações
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Orientações', 
  'orientations', 
  'textarea', 
  'Orientações gerais para o paciente...', 
  NULL, 
  false, 
  3, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Retorno
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Retorno', 
  'return_date', 
  'date', 
  'Data do retorno', 
  'Agendar retorno se necessário', 
  false, 
  4, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Atestado médico
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Atestado médico', 
  'medical_certificate', 
  'boolean', 
  NULL, 
  'Emitir atestado médico?', 
  false, 
  5, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

-- Dias de atestado
INSERT INTO questionnaire_fields (id, questionnaire_id, label, field_key, field_type, placeholder, help_text, is_required, min_value, max_value, "order", created_at, updated_at)
SELECT 
  gen_random_uuid(), 
  q.id, 
  'Dias de atestado', 
  'certificate_days', 
  'number', 
  'Quantidade de dias', 
  NULL, 
  false, 
  0, 
  30, 
  6, 
  NOW(), 
  NOW()
FROM questionnaires q 
WHERE q.name = 'Prescrição Médica' AND q.clinic_id = (SELECT id FROM clinics LIMIT 1);

