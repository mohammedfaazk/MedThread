/**
 * Safe Seed Script - Handles existing data
 * Run: npx ts-node seed-features-safe.ts
 */

import { prisma } from '@medthread/database';
import { hash } from 'bcryptjs';

async function seedSafe() {
  console.log('🌱 Starting safe seed (skips existing data)...\n');

  try {
    const hashedPassword = await hash('Doctor@123', 10);

    // 1. Get or create doctors
    console.log('1️⃣ Getting/creating doctors...');
    const doctorData = [
      { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', email: 'sarah.johnson@medthread.com', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Dr. Michael Chen', specialty: 'Neurology', email: 'michael.chen@medthread.com', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', email: 'emily.rodriguez@medthread.com', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Dr. James Wilson', specialty: 'Orthopedics', email: 'james.wilson@medthread.com', city: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Dr. Lisa Anderson', specialty: 'Dermatology', email: 'lisa.anderson@medthread.com', city: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    ];

    const doctors = [];
    for (const doc of doctorData) {
      const doctor = await prisma.user.upsert({
        where: { email: doc.email },
        update: {},
        create: {
          username: doc.name,
          email: doc.email,
          passwordHash: hashedPassword,
          role: 'DOCTOR',
          specialty: doc.specialty,
          verified: true,
          doctorVerificationStatus: 'APPROVED',
          yearsOfExperience: Math.floor(Math.random() * 15) + 5,
          hospitalAffiliation: `${doc.city} General Hospital`,
        }
      });
      doctors.push({ ...doctor, city: doc.city, lat: doc.lat, lng: doc.lng });
    }
    console.log(`✓ ${doctors.length} doctors ready`);

    // 2. Get or create patients
    console.log('\n2️⃣ Getting/creating patients...');
    const patientData = [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Smith', email: 'jane.smith@example.com' },
      { name: 'Bob Williams', email: 'bob.williams@example.com' },
    ];

    const patients = [];
    for (const pat of patientData) {
      const patient = await prisma.user.upsert({
        where: { email: pat.email },
        update: {},
        create: {
          username: pat.name,
          email: pat.email,
          passwordHash: hashedPassword,
          role: 'PATIENT',
          verified: true,
        }
      });
      patients.push(patient);
    }
    console.log(`✓ ${patients.length} patients ready`);

    // 3. Seed all features with ON CONFLICT
    console.log('\n3️⃣ Seeding all feature data...');
    
    for (const doctor of doctors) {
      const overallRating = 4.5 + Math.random() * 0.5;
      const totalReviews = Math.floor(Math.random() * 100) + 50;

      // Feature 2: Clinics & Availability
      await prisma.$executeRaw`
        INSERT INTO "DoctorClinic" (doctor_id, clinic_name, address, city, state, country, latitude, longitude, phone, is_primary)
        VALUES (${doctor.id}, ${`${doctor.username}'s Clinic`}, ${'123 Medical St'}, ${doctor.city}, ${'CA'}, ${'USA'}, ${doctor.lat}, ${doctor.lng}, ${'+1-555-0100'}, true)
        ON CONFLICT (doctor_id) WHERE is_primary = true DO NOTHING
      `;

      await prisma.$executeRaw`
        INSERT INTO "DoctorAvailability" (doctor_id, telemedicine_available, in_person_available, next_available_slot, accepts_all_insurance)
        VALUES (${doctor.id}, true, true, ${new Date(Date.now() + 24 * 60 * 60 * 1000)}, true)
        ON CONFLICT (doctor_id) DO NOTHING
      `;

      // Feature 3: Ratings & Rankings
      await prisma.$executeRaw`
        INSERT INTO "DoctorRating" (doctor_id, overall_rating, total_reviews, response_time_minutes, consultation_success_rate, patient_satisfaction_score, helpful_replies_count, total_replies_count)
        VALUES (${doctor.id}, ${overallRating}, ${totalReviews}, ${Math.floor(Math.random() * 60) + 15}, ${85 + Math.random() * 15}, ${overallRating}, ${Math.floor(Math.random() * 50) + 20}, ${Math.floor(Math.random() * 100) + 50})
        ON CONFLICT (doctor_id) DO NOTHING
      `;

      // Feature 4: SEO Profiles
      const slug = doctor.username.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.$executeRaw`
        INSERT INTO "DoctorSEOProfile" (doctor_id, slug, meta_title, meta_description, structured_data, canonical_url, is_published)
        VALUES (${doctor.id}, ${slug}, ${`${doctor.username} - ${doctor.specialty} in ${doctor.city}`}, ${`Book appointment with ${doctor.username}`}, ${JSON.stringify({ '@type': 'Physician' })}::jsonb, ${`https://medthread.com/doctors/${slug}`}, true)
        ON CONFLICT (doctor_id) DO NOTHING
      `;

      // Feature 5: Business Analytics
      await prisma.$executeRaw`
        INSERT INTO "DoctorBusinessAnalytics" (doctor_id, profile_views, profile_clicks, booking_clicks, bookings_completed, conversion_rate, period_start, period_end)
        VALUES (${doctor.id}, ${Math.floor(Math.random() * 1000) + 500}, ${Math.floor(Math.random() * 200) + 100}, ${Math.floor(Math.random() * 50) + 20}, ${Math.floor(Math.random() * 30) + 10}, ${5 + Math.random() * 10}, ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}, ${new Date()})
        ON CONFLICT DO NOTHING
      `;

      // Feature 7: Gamification - Badges
      for (const badgeId of [1, 2, 3]) {
        await prisma.$executeRaw`
          INSERT INTO "DoctorBadge" (doctor_id, badge_id, earned_at)
          VALUES (${doctor.id}, ${badgeId}, ${new Date()})
          ON CONFLICT DO NOTHING
        `;
      }

      // Feature 7: Gamification - Points
      await prisma.$executeRaw`
        INSERT INTO "DoctorPoints" (doctor_id, total_points, activity_points, badge_points, achievement_points, current_level)
        VALUES (${doctor.id}, ${Math.floor(Math.random() * 5000) + 1000}, ${Math.floor(Math.random() * 2000) + 500}, ${Math.floor(Math.random() * 1500) + 300}, ${Math.floor(Math.random() * 1500) + 200}, ${Math.floor(Math.random() * 5) + 3})
        ON CONFLICT (doctor_id) DO UPDATE SET total_points = EXCLUDED.total_points
      `;

      // Feature 8: Smart Matching - Expertise
      await prisma.$executeRaw`
        INSERT INTO "DoctorExpertise" (doctor_id, expertise_area, symptom_categories, cases_handled, success_rate, confidence_level, is_verified)
        VALUES (${doctor.id}, ${doctor.specialty}, ARRAY['Respiratory', 'Cardiovascular'], ${Math.floor(Math.random() * 500) + 100}, ${85 + Math.random() * 15}, ${'expert'}, true)
        ON CONFLICT (doctor_id, expertise_area) DO NOTHING
      `;

      // Feature 8: Smart Matching - Languages
      await prisma.$executeRaw`
        INSERT INTO "DoctorLanguage" (doctor_id, language_code, language_name, proficiency_level, is_primary)
        VALUES (${doctor.id}, ${'en'}, ${'English'}, ${'native'}, true)
        ON CONFLICT (doctor_id, language_code) DO NOTHING
      `;

      // Feature 8: Smart Matching - Insurance
      await prisma.$executeRaw`
        INSERT INTO "DoctorInsurance" (doctor_id, insurance_provider, insurance_plan_types, is_in_network, verification_status)
        VALUES (${doctor.id}, ${'Blue Cross'}, ARRAY['PPO', 'HMO'], true, ${'verified'})
        ON CONFLICT (doctor_id, insurance_provider) DO NOTHING
      `;

      // Feature 10: Trust & Safety - License
      await prisma.$executeRaw`
        INSERT INTO "MedicalLicenseVerification" (doctor_id, license_number, license_type, issuing_authority, issuing_country, issuing_state, issue_date, expiry_date, verification_status, verified_at)
        VALUES (${doctor.id}, ${`MD${Math.floor(Math.random() * 100000)}`}, ${'MD'}, ${'State Medical Board'}, ${'USA'}, ${'CA'}, ${new Date('2015-01-01')}, ${new Date('2025-12-31')}, ${'verified'}, ${new Date()})
        ON CONFLICT (license_number, issuing_authority) DO NOTHING
      `;

      // Feature 10: Trust & Safety - Hospital
      await prisma.$executeRaw`
        INSERT INTO "HospitalAffiliationVerification" (doctor_id, hospital_name, hospital_city, hospital_state, hospital_country, affiliation_type, start_date, is_current, verification_status, verified_at)
        VALUES (${doctor.id}, ${doctor.hospitalAffiliation}, ${doctor.city}, ${'CA'}, ${'USA'}, ${'staff'}, ${new Date('2018-01-01')}, true, ${'verified'}, ${new Date()})
        ON CONFLICT DO NOTHING
      `;

      // Calculate trust score
      await prisma.$executeRaw`SELECT calculate_trust_score(${doctor.id}, ${'doctor'})`;

      // Add reviews
      for (let i = 0; i < 3; i++) {
        const patient = patients[i % patients.length];
        await prisma.$executeRaw`
          INSERT INTO "DoctorReview" (doctor_id, patient_id, rating, review_text, response_time_rating, professionalism_rating, communication_rating, would_recommend, is_verified)
          VALUES (${doctor.id}, ${patient.id}, ${4 + Math.random()}, ${'Excellent doctor, very professional and caring.'}, ${4 + Math.random()}, ${4 + Math.random()}, ${4 + Math.random()}, true, true)
          ON CONFLICT DO NOTHING
        `;
      }
    }

    // Calculate patient trust scores
    for (const patient of patients) {
      await prisma.$executeRaw`SELECT calculate_trust_score(${patient.id}, ${'patient'})`;
    }

    console.log('✓ All feature data seeded');

    console.log('\n✅ Seed completed successfully!');
    console.log(`\n📊 Summary: ${doctors.length} doctors, ${patients.length} patients, all features populated`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedSafe();
