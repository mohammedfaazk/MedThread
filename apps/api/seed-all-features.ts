/**
 * Comprehensive Seed Script for All 10 Features
 * Run: npx ts-node seed-all-features.ts
 */

import { prisma } from '@medthread/database';
import { hash } from 'bcryptjs';

async function seedAllFeatures() {
  console.log('🌱 Starting comprehensive seed...\n');

  try {
    // 1. Create sample doctors
    console.log('1️⃣ Creating sample doctors...');
    const doctors = [];
    
    const doctorData = [
      { name: 'Dr. Sarah Johnson', specialty: 'Cardiology', email: 'sarah.johnson@medthread.com', city: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Dr. Michael Chen', specialty: 'Neurology', email: 'michael.chen@medthread.com', city: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Dr. Emily Rodriguez', specialty: 'Pediatrics', email: 'emily.rodriguez@medthread.com', city: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Dr. James Wilson', specialty: 'Orthopedics', email: 'james.wilson@medthread.com', city: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Dr. Lisa Anderson', specialty: 'Dermatology', email: 'lisa.anderson@medthread.com', city: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    ];

    const hashedPassword = await hash('Doctor@123', 10);

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
    console.log(`✓ Created ${doctors.length} doctors`);

    // 2. Create sample patients
    console.log('\n2️⃣ Creating sample patients...');
    const patients = [];
    const patientData = [
      { name: 'John Doe', email: 'john.doe@example.com' },
      { name: 'Jane Smith', email: 'jane.smith@example.com' },
      { name: 'Bob Williams', email: 'bob.williams@example.com' },
    ];

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
    console.log(`✓ Created ${patients.length} patients`);

    // 3. Seed Feature 2: Area-Wise Doctor Replies
    console.log('\n3️⃣ Seeding Area-Wise Doctor Replies data...');
    for (const doctor of doctors) {
      // Create clinic (skip if exists)
      await prisma.$executeRaw`
        INSERT INTO "DoctorClinic" (
          doctor_id, clinic_name, address, city, state, country,
          latitude, longitude, phone, is_primary
        ) VALUES (
          ${doctor.id}, ${`${doctor.username}'s Clinic`}, ${`123 Medical St`},
          ${doctor.city}, ${'CA'}, ${'USA'},
          ${doctor.lat}, ${doctor.lng}, ${'+1-555-0100'}, true
        )
        ON CONFLICT (doctor_id) WHERE is_primary = true DO NOTHING
      `;

      // Create availability (skip if exists)
      await prisma.$executeRaw`
        INSERT INTO "DoctorAvailability" (
          doctor_id, telemedicine_available, in_person_available,
          next_available_slot, accepts_all_insurance
        ) VALUES (
          ${doctor.id}, true, true,
          ${new Date(Date.now() + 24 * 60 * 60 * 1000)}, true
        )
        ON CONFLICT (doctor_id) DO NOTHING
      `;
    }
    console.log('✓ Created clinics and availability');

    // 4. Seed Feature 3: Regional Top Doctors
    console.log('\n4️⃣ Seeding Regional Top Doctors data...');
    for (const doctor of doctors) {
      const overallRating = 4.5 + Math.random() * 0.5;
      const totalReviews = Math.floor(Math.random() * 100) + 50;
      
      // Create doctor rating
      await prisma.$executeRaw`
        INSERT INTO "DoctorRating" (
          doctor_id, overall_rating, total_reviews,
          response_time_minutes, consultation_success_rate,
          patient_satisfaction_score, helpful_replies_count,
          total_replies_count
        ) VALUES (
          ${doctor.id}, ${overallRating}, ${totalReviews},
          ${Math.floor(Math.random() * 60) + 15}, ${85 + Math.random() * 15},
          ${overallRating}, ${Math.floor(Math.random() * 50) + 20},
          ${Math.floor(Math.random() * 100) + 50}
        )
        ON CONFLICT (doctor_id) DO NOTHING
      `;

      // Create sample reviews
      for (let i = 0; i < 3; i++) {
        const patient = patients[i % patients.length];
        await prisma.$executeRaw`
          INSERT INTO "DoctorReview" (
            doctor_id, patient_id, rating, review_text,
            response_time_rating, professionalism_rating,
            communication_rating, would_recommend, is_verified
          ) VALUES (
            ${doctor.id}, ${patient.id}, ${4 + Math.random()},
            ${'Excellent doctor, very professional and caring.'},
            ${4 + Math.random()}, ${4 + Math.random()}, ${4 + Math.random()},
            true, true
          )
          ON CONFLICT DO NOTHING
        `;
      }
    }
    console.log('✓ Created ratings and reviews');

    // 5. Seed Feature 4: SEO Rating Website
    console.log('\n5️⃣ Seeding SEO Rating Website data...');
    for (const doctor of doctors) {
      const slug = doctor.username.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      await prisma.$executeRaw`
        INSERT INTO "DoctorSEOProfile" (
          doctor_id, slug, meta_title, meta_description,
          structured_data, canonical_url, is_published
        ) VALUES (
          ${doctor.id}, ${slug},
          ${`${doctor.username} - ${doctor.specialty} in ${doctor.city}`},
          ${`Book appointment with ${doctor.username}, experienced ${doctor.specialty} specialist in ${doctor.city}`},
          ${JSON.stringify({ '@type': 'Physician', name: doctor.username })}::jsonb,
          ${`https://medthread.com/doctors/${slug}`}, true
        )
        ON CONFLICT (doctor_id) DO NOTHING
      `;
    }
    console.log('✓ Created SEO profiles');

    // 6. Seed Feature 5: Doctor Business Dashboard
    console.log('\n6️⃣ Seeding Doctor Business Dashboard data...');
    for (const doctor of doctors) {
      await prisma.$executeRaw`
        INSERT INTO "DoctorBusinessAnalytics" (
          doctor_id, profile_views, profile_clicks, booking_clicks,
          bookings_completed, conversion_rate, period_start, period_end
        ) VALUES (
          ${doctor.id}, ${Math.floor(Math.random() * 1000) + 500},
          ${Math.floor(Math.random() * 200) + 100},
          ${Math.floor(Math.random() * 50) + 20},
          ${Math.floor(Math.random() * 30) + 10},
          ${5 + Math.random() * 10},
          ${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)},
          ${new Date()}
        )
      `;
    }
    console.log('✓ Created business analytics');

    // 7. Seed Feature 7: Gamification
    console.log('\n7️⃣ Seeding Gamification data...');
    for (const doctor of doctors) {
      // Award some badges
      const badgeIds = [1, 2, 3]; // Quick Responder, Community Hero, Patient Favorite
      for (const badgeId of badgeIds) {
        await prisma.$executeRaw`
          INSERT INTO "DoctorBadge" (
            doctor_id, badge_id, earned_at
          ) VALUES (
            ${doctor.id}, ${badgeId}, ${new Date()}
          )
          ON CONFLICT DO NOTHING
        `;
      }

      // Create points
      await prisma.$executeRaw`
        INSERT INTO "DoctorPoints" (
          doctor_id, total_points, activity_points,
          badge_points, achievement_points, current_level
        ) VALUES (
          ${doctor.id}, ${Math.floor(Math.random() * 5000) + 1000},
          ${Math.floor(Math.random() * 2000) + 500},
          ${Math.floor(Math.random() * 1500) + 300},
          ${Math.floor(Math.random() * 1500) + 200},
          ${Math.floor(Math.random() * 5) + 3}
        )
        ON CONFLICT (doctor_id) DO UPDATE
        SET total_points = EXCLUDED.total_points
      `;
    }
    console.log('✓ Created badges and points');

    // 8. Seed Feature 8: Smart Matching
    console.log('\n8️⃣ Seeding Smart Matching data...');
    for (const doctor of doctors) {
      // Create doctor expertise
      const symptoms = ['Respiratory', 'Cardiovascular', 'Gastrointestinal'];
      await prisma.$executeRaw`
        INSERT INTO "DoctorExpertise" (
          doctor_id, expertise_area, symptom_categories,
          cases_handled, success_rate, confidence_level, is_verified
        ) VALUES (
          ${doctor.id}, ${doctor.specialty}, ${symptoms},
          ${Math.floor(Math.random() * 500) + 100},
          ${85 + Math.random() * 15}, ${'expert'}, true
        )
        ON CONFLICT (doctor_id, expertise_area) DO NOTHING
      `;

      // Create doctor languages
      await prisma.$executeRaw`
        INSERT INTO "DoctorLanguage" (
          doctor_id, language_code, language_name,
          proficiency_level, is_primary
        ) VALUES (
          ${doctor.id}, ${'en'}, ${'English'}, ${'native'}, true
        )
        ON CONFLICT (doctor_id, language_code) DO NOTHING
      `;

      // Create doctor insurance
      await prisma.$executeRaw`
        INSERT INTO "DoctorInsurance" (
          doctor_id, insurance_provider, insurance_plan_types,
          is_in_network, verification_status
        ) VALUES (
          ${doctor.id}, ${'Blue Cross'}, ARRAY['PPO', 'HMO'],
          true, ${'verified'}
        )
        ON CONFLICT (doctor_id, insurance_provider) DO NOTHING
      `;
    }
    console.log('✓ Created expertise, languages, and insurance');

    // 9. Seed Feature 10: Trust & Safety
    console.log('\n9️⃣ Seeding Trust & Safety data...');
    for (const doctor of doctors) {
      // Create license verification
      await prisma.$executeRaw`
        INSERT INTO "MedicalLicenseVerification" (
          doctor_id, license_number, license_type,
          issuing_authority, issuing_country, issuing_state,
          issue_date, expiry_date, verification_status, verified_at
        ) VALUES (
          ${doctor.id}, ${`MD${Math.floor(Math.random() * 100000)}`}, ${'MD'},
          ${'State Medical Board'}, ${'USA'}, ${'CA'},
          ${new Date('2015-01-01')}, ${new Date('2025-12-31')},
          ${'verified'}, ${new Date()}
        )
        ON CONFLICT (license_number, issuing_authority) DO NOTHING
      `;

      // Create hospital affiliation
      await prisma.$executeRaw`
        INSERT INTO "HospitalAffiliationVerification" (
          doctor_id, hospital_name, hospital_city,
          hospital_state, hospital_country, affiliation_type,
          start_date, is_current, verification_status, verified_at
        ) VALUES (
          ${doctor.id}, ${doctor.hospitalAffiliation}, ${doctor.city},
          ${'CA'}, ${'USA'}, ${'staff'},
          ${new Date('2018-01-01')}, true, ${'verified'}, ${new Date()}
        )
      `;

      // Calculate trust score
      await prisma.$executeRaw`
        SELECT calculate_trust_score(${doctor.id}, ${'doctor'})
      `;
    }
    console.log('✓ Created verifications and trust scores');

    // 10. Update user trust scores for patients
    console.log('\n🔟 Calculating patient trust scores...');
    for (const patient of patients) {
      await prisma.$executeRaw`
        SELECT calculate_trust_score(${patient.id}, ${'patient'})
      `;
    }
    console.log('✓ Calculated trust scores');

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Doctors: ${doctors.length}`);
    console.log(`  - Patients: ${patients.length}`);
    console.log(`  - Clinics: ${doctors.length}`);
    console.log(`  - Reviews: ${doctors.length * 3}`);
    console.log(`  - Badges: ${doctors.length * 3}`);
    console.log(`  - Trust Scores: ${doctors.length + patients.length}`);

  } catch (error) {
    console.error('❌ Error seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedAllFeatures();
