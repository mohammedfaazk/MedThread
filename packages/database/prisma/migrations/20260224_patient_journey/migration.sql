-- Patient Journey Optimization Migration
-- Complete patient flow from discovery to follow-up

-- Create PatientJourney table to track the entire patient journey
CREATE TABLE IF NOT EXISTS "PatientJourney" (
  id SERIAL PRIMARY KEY,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Journey stages
  current_stage VARCHAR(50) NOT NULL DEFAULT 'discovery', -- 'discovery', 'consultation', 'follow_up', 'completed'
  
  -- Discovery phase
  discovery_source VARCHAR(100), -- 'google_search', 'rating_site', 'platform', 'referral', 'direct'
  discovery_keyword TEXT,
  profile_viewed_at TIMESTAMP,
  profile_view_count INTEGER DEFAULT 0,
  
  -- Consultation phase
  booking_initiated_at TIMESTAMP,
  booking_completed_at TIMESTAMP,
  appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  questionnaire_completed_at TIMESTAMP,
  consultation_completed_at TIMESTAMP,
  
  -- Follow-up phase
  review_requested_at TIMESTAMP,
  review_submitted_at TIMESTAMP,
  review_id INTEGER,
  prescription_issued_at TIMESTAMP,
  follow_up_scheduled_at TIMESTAMP,
  follow_up_appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  
  -- Journey metrics
  time_to_booking_minutes INTEGER, -- Time from discovery to booking
  time_to_consultation_minutes INTEGER, -- Time from booking to consultation
  time_to_review_minutes INTEGER, -- Time from consultation to review
  total_journey_time_minutes INTEGER,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(patient_id, doctor_id, appointment_id)
);

-- Create indexes for journey tracking
CREATE INDEX IF NOT EXISTS idx_journey_patient ON "PatientJourney"(patient_id);
CREATE INDEX IF NOT EXISTS idx_journey_doctor ON "PatientJourney"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_journey_stage ON "PatientJourney"(current_stage);
CREATE INDEX IF NOT EXISTS idx_journey_appointment ON "PatientJourney"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_journey_source ON "PatientJourney"(discovery_source);

-- Create PreConsultationQuestionnaire table
CREATE TABLE IF NOT EXISTS "PreConsultationQuestionnaire" (
  id SERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Basic information
  chief_complaint TEXT NOT NULL,
  symptoms TEXT[],
  symptom_duration VARCHAR(100),
  symptom_severity VARCHAR(50), -- 'mild', 'moderate', 'severe'
  
  -- Medical history
  current_medications TEXT[],
  allergies TEXT[],
  past_medical_conditions TEXT[],
  family_medical_history TEXT,
  
  -- Lifestyle
  smoking_status VARCHAR(50),
  alcohol_consumption VARCHAR(50),
  exercise_frequency VARCHAR(50),
  
  -- Specific questions (JSON for flexibility)
  custom_questions JSONB,
  custom_answers JSONB,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(appointment_id)
);

-- Create indexes for questionnaire lookups
CREATE INDEX IF NOT EXISTS idx_questionnaire_appointment ON "PreConsultationQuestionnaire"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_patient ON "PreConsultationQuestionnaire"(patient_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_doctor ON "PreConsultationQuestionnaire"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_questionnaire_completed ON "PreConsultationQuestionnaire"(is_completed);

-- Create AppointmentReminder table for automated reminders
CREATE TABLE IF NOT EXISTS "AppointmentReminder" (
  id SERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Reminder details
  reminder_type VARCHAR(50) NOT NULL, -- 'booking_confirmation', '24h_before', '1h_before', 'post_consultation'
  reminder_channel VARCHAR(50) NOT NULL, -- 'email', 'sms', 'push', 'in_app'
  
  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  
  -- Content
  subject VARCHAR(255),
  message TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'cancelled'
  error_message TEXT,
  
  -- Engagement
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for reminder management
CREATE INDEX IF NOT EXISTS idx_reminder_appointment ON "AppointmentReminder"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_reminder_patient ON "AppointmentReminder"(patient_id);
CREATE INDEX IF NOT EXISTS idx_reminder_scheduled ON "AppointmentReminder"(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_reminder_status ON "AppointmentReminder"(status);

-- Create Prescription table for prescription management
CREATE TABLE IF NOT EXISTS "Prescription" (
  id SERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Prescription details
  prescription_number VARCHAR(100) UNIQUE NOT NULL,
  diagnosis TEXT NOT NULL,
  
  -- Medications (array of medication objects)
  medications JSONB NOT NULL, -- [{name, dosage, frequency, duration, instructions}]
  
  -- Instructions
  general_instructions TEXT,
  dietary_restrictions TEXT,
  follow_up_instructions TEXT,
  
  -- Validity
  issued_date DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'completed', 'cancelled', 'expired'
  
  -- Digital signature
  doctor_signature TEXT,
  digital_signature_hash VARCHAR(255),
  
  -- Pharmacy
  pharmacy_name VARCHAR(255),
  pharmacy_contact VARCHAR(100),
  dispensed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for prescription lookups
CREATE INDEX IF NOT EXISTS idx_prescription_appointment ON "Prescription"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_prescription_patient ON "Prescription"(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescription_doctor ON "Prescription"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescription_number ON "Prescription"(prescription_number);
CREATE INDEX IF NOT EXISTS idx_prescription_status ON "Prescription"(status);

-- Create ReviewRequest table for post-consultation review requests
CREATE TABLE IF NOT EXISTS "ReviewRequest" (
  id SERIAL PRIMARY KEY,
  appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Request details
  request_type VARCHAR(50) DEFAULT 'post_consultation', -- 'post_consultation', 'follow_up', 'reminder'
  
  -- Scheduling
  scheduled_for TIMESTAMP NOT NULL,
  sent_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'completed', 'declined', 'expired'
  
  -- Response
  review_submitted_at TIMESTAMP,
  review_id INTEGER,
  testimonial_id INTEGER,
  
  -- Engagement
  opened_at TIMESTAMP,
  clicked_at TIMESTAMP,
  
  -- Incentive
  incentive_offered VARCHAR(100), -- 'discount', 'free_consultation', 'none'
  incentive_claimed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for review request management
CREATE INDEX IF NOT EXISTS idx_review_request_appointment ON "ReviewRequest"(appointment_id);
CREATE INDEX IF NOT EXISTS idx_review_request_patient ON "ReviewRequest"(patient_id);
CREATE INDEX IF NOT EXISTS idx_review_request_doctor ON "ReviewRequest"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_review_request_scheduled ON "ReviewRequest"(scheduled_for, status);
CREATE INDEX IF NOT EXISTS idx_review_request_status ON "ReviewRequest"(status);

-- Create FollowUpAppointment table for follow-up scheduling
CREATE TABLE IF NOT EXISTS "FollowUpAppointment" (
  id SERIAL PRIMARY KEY,
  original_appointment_id TEXT NOT NULL REFERENCES "Appointment"(id) ON DELETE CASCADE,
  follow_up_appointment_id TEXT REFERENCES "Appointment"(id) ON DELETE SET NULL,
  patient_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- Follow-up details
  recommended_by_doctor BOOLEAN DEFAULT false,
  recommended_date DATE,
  recommended_reason TEXT,
  
  -- Scheduling
  scheduled_date DATE,
  scheduled_time TIME,
  
  -- Status
  status VARCHAR(50) DEFAULT 'recommended', -- 'recommended', 'scheduled', 'completed', 'cancelled', 'missed'
  
  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for follow-up management
CREATE INDEX IF NOT EXISTS idx_follow_up_original ON "FollowUpAppointment"(original_appointment_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_appointment ON "FollowUpAppointment"(follow_up_appointment_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_patient ON "FollowUpAppointment"(patient_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_doctor ON "FollowUpAppointment"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_status ON "FollowUpAppointment"(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_date ON "FollowUpAppointment"(scheduled_date);

-- Create BookingCTA table to track CTA performance
CREATE TABLE IF NOT EXISTS "BookingCTA" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  
  -- CTA details
  cta_type VARCHAR(50) NOT NULL, -- 'book_now', 'check_availability', 'instant_booking', 'schedule_call'
  cta_location VARCHAR(100) NOT NULL, -- 'profile_header', 'profile_sidebar', 'rating_site', 'search_results'
  cta_text VARCHAR(255),
  
  -- Display
  is_prominent BOOLEAN DEFAULT true,
  display_priority INTEGER DEFAULT 0,
  
  -- Availability display
  show_real_time_availability BOOLEAN DEFAULT true,
  show_next_available_slot BOOLEAN DEFAULT true,
  
  -- Performance
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  bookings INTEGER DEFAULT 0,
  ctr DECIMAL(5, 2) DEFAULT 0.00,
  conversion_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- A/B testing
  variant VARCHAR(50) DEFAULT 'default',
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for CTA tracking
CREATE INDEX IF NOT EXISTS idx_cta_doctor ON "BookingCTA"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_cta_type ON "BookingCTA"(cta_type);
CREATE INDEX IF NOT EXISTS idx_cta_location ON "BookingCTA"(cta_location);
CREATE INDEX IF NOT EXISTS idx_cta_active ON "BookingCTA"(is_active);

-- Add journey tracking fields to Appointment table
ALTER TABLE "Appointment"
ADD COLUMN IF NOT EXISTS journey_id INTEGER REFERENCES "PatientJourney"(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS questionnaire_completed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reminder_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prescription_issued BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS review_requested BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS follow_up_recommended BOOLEAN DEFAULT false;

-- Create index on journey_id
CREATE INDEX IF NOT EXISTS idx_appointment_journey ON "Appointment"(journey_id);

-- Create function to update journey stage
CREATE OR REPLACE FUNCTION update_journey_stage()
RETURNS TRIGGER AS $$
BEGIN
  -- Update journey stage based on appointment status
  IF NEW.status = 'CONFIRMED' AND OLD.status != 'CONFIRMED' THEN
    UPDATE "PatientJourney"
    SET current_stage = 'consultation',
        booking_completed_at = CURRENT_TIMESTAMP,
        time_to_booking_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - profile_viewed_at)) / 60
    WHERE appointment_id = NEW.id;
  ELSIF NEW.status = 'COMPLETED' AND OLD.status != 'COMPLETED' THEN
    UPDATE "PatientJourney"
    SET current_stage = 'follow_up',
        consultation_completed_at = CURRENT_TIMESTAMP,
        time_to_consultation_minutes = EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - booking_completed_at)) / 60
    WHERE appointment_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for journey stage updates
DROP TRIGGER IF EXISTS trigger_update_journey_stage ON "Appointment";
CREATE TRIGGER trigger_update_journey_stage
  AFTER UPDATE ON "Appointment"
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION update_journey_stage();

-- Create function to schedule automated reminders
CREATE OR REPLACE FUNCTION schedule_appointment_reminders()
RETURNS void AS $$
DECLARE
  appointment RECORD;
BEGIN
  -- Schedule reminders for confirmed appointments
  FOR appointment IN 
    SELECT * FROM "Appointment" 
    WHERE status = 'CONFIRMED' 
      AND "scheduledAt" > CURRENT_TIMESTAMP
      AND reminder_count = 0
  LOOP
    -- 24 hours before reminder
    INSERT INTO "AppointmentReminder" (
      appointment_id, patient_id, doctor_id, reminder_type, reminder_channel,
      scheduled_for, subject, message
    ) VALUES (
      appointment.id, appointment."patientId", appointment."doctorId",
      '24h_before', 'email',
      appointment."scheduledAt" - INTERVAL '24 hours',
      'Appointment Reminder - Tomorrow',
      'Your appointment is scheduled for tomorrow.'
    );
    
    -- 1 hour before reminder
    INSERT INTO "AppointmentReminder" (
      appointment_id, patient_id, doctor_id, reminder_type, reminder_channel,
      scheduled_for, subject, message
    ) VALUES (
      appointment.id, appointment."patientId", appointment."doctorId",
      '1h_before', 'email',
      appointment."scheduledAt" - INTERVAL '1 hour',
      'Appointment Reminder - In 1 Hour',
      'Your appointment is in 1 hour.'
    );
    
    -- Update reminder count
    UPDATE "Appointment"
    SET reminder_count = 2
    WHERE id = appointment.id;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
