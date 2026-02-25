-- Area-Wise Doctor Replies Migration
-- Add location and availability fields for doctors

-- Enable PostGIS extension for spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Add location fields to User table
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(255),
ADD COLUMN IF NOT EXISTS location_sharing_enabled BOOLEAN DEFAULT false;

-- Create spatial index for user locations
CREATE INDEX IF NOT EXISTS idx_user_location ON "User" USING GIST (
  ST_SetSRID(ST_MakePoint(COALESCE(longitude, 0), COALESCE(latitude, 0)), 4326)
) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create DoctorClinic table
CREATE TABLE IF NOT EXISTS "DoctorClinic" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  clinic_name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  phone VARCHAR(50),
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create spatial index for clinic locations
CREATE INDEX IF NOT EXISTS idx_clinic_location ON "DoctorClinic" USING GIST (
  ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
);

-- Create index for doctor lookups
CREATE INDEX IF NOT EXISTS idx_clinic_doctor ON "DoctorClinic"(doctor_id);

-- Create ClinicHours table
CREATE TABLE IF NOT EXISTS "ClinicHours" (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, day_of_week)
);

-- Create index for clinic hours lookups
CREATE INDEX IF NOT EXISTS idx_clinic_hours_clinic ON "ClinicHours"(clinic_id);

-- Create ClinicException table
CREATE TABLE IF NOT EXISTS "ClinicException" (
  id SERIAL PRIMARY KEY,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN DEFAULT true,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(clinic_id, exception_date)
);

-- Create index for exception lookups
CREATE INDEX IF NOT EXISTS idx_clinic_exception_clinic_date ON "ClinicException"(clinic_id, exception_date);

-- Create DoctorAvailability table
CREATE TABLE IF NOT EXISTS "DoctorAvailability" (
  id SERIAL PRIMARY KEY,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  telemedicine_available BOOLEAN DEFAULT false,
  in_person_available BOOLEAN DEFAULT true,
  emergency_available BOOLEAN DEFAULT false,
  insurance_accepted TEXT[],
  accepts_all_insurance BOOLEAN DEFAULT false,
  average_wait_time_minutes INTEGER,
  next_available_slot TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id)
);

-- Create indexes for availability lookups
CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor ON "DoctorAvailability"(doctor_id);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_telemedicine ON "DoctorAvailability"(telemedicine_available);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_emergency ON "DoctorAvailability"(emergency_available);
CREATE INDEX IF NOT EXISTS idx_doctor_availability_insurance ON "DoctorAvailability" USING GIN (insurance_accepted);

-- Create DistanceCache table
CREATE TABLE IF NOT EXISTS "DistanceCache" (
  id SERIAL PRIMARY KEY,
  patient_lat DECIMAL(10, 8) NOT NULL,
  patient_lng DECIMAL(11, 8) NOT NULL,
  doctor_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,
  clinic_id INTEGER NOT NULL REFERENCES "DoctorClinic"(id) ON DELETE CASCADE,
  distance_km DECIMAL(10, 2) NOT NULL,
  calculated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL
);

-- Create composite index for cache lookups
CREATE INDEX IF NOT EXISTS idx_distance_cache_lookup ON "DistanceCache"(
  patient_lat, patient_lng, doctor_id, clinic_id, expires_at
);

-- Create index for cleanup of expired entries
CREATE INDEX IF NOT EXISTS idx_distance_cache_expires ON "DistanceCache"(expires_at);
