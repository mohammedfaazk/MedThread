/**
 * Seed Corrections - Fix column names and add missing data
 * Run: npx ts-node seed-corrections.ts
 */

import { prisma } from '@medthread/database';

async function seedCorrections() {
  console.log('🔧 Applying seed corrections...\n');

  try {
    // Get all doctors
    const doctors = await prisma.user.findMany({
      where: { role: 'DOCTOR' }
    });

    console.log(`Found ${doctors.length} doctors\n`);

    let fixed = 0;

    for (const doctor of doctors) {
      // Fix Feature 4: SEO Profiles (correct column name: schema_markup)
      try {
        const slug = doctor.username.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await prisma.$executeRaw`
          INSERT INTO "DoctorSEOProfile" (
            doctor_id, slug, meta_title, meta_description, 
            schema_markup, canonical_url, is_published
          ) VALUES (
            ${doctor.id}, 
            ${slug}, 
            ${`${doctor.username} - ${doctor.specialty || 'Doctor'}`}, 
            ${`Book appointment with ${doctor.username}`}, 
            ${JSON.stringify({ '@type': 'Physician', name: doctor.username })}::jsonb, 
            ${`https://medthread.com/doctors/${slug}`}, 
            true
          )
          ON CONFLICT (doctor_id) DO NOTHING
        `;
        fixed++;
        console.log(`✓ SEO profile for ${doctor.username}`);
      } catch (e) {
        console.log(`  Skip SEO for ${doctor.username} (exists)`);
      }

      // Fix Feature 5: Business Analytics (correct column names)
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        await prisma.$executeRaw`
          INSERT INTO "DoctorBusinessAnalytics" (
            doctor_id, date,
            profile_views_total, profile_views_seo, profile_views_platform,
            consultation_requests, consultations_completed, conversion_rate,
            revenue_total, revenue_consultations, net_revenue,
            new_patients, returning_patients, average_rating, new_reviews
          ) VALUES (
            ${doctor.id}, 
            ${today},
            ${Math.floor(Math.random() * 1000) + 500},
            ${Math.floor(Math.random() * 300) + 100},
            ${Math.floor(Math.random() * 400) + 200},
            ${Math.floor(Math.random() * 50) + 20},
            ${Math.floor(Math.random() * 30) + 10},
            ${5 + Math.random() * 10},
            ${Math.floor(Math.random() * 5000) + 2000},
            ${Math.floor(Math.random() * 4000) + 1500},
            ${Math.floor(Math.random() * 3500) + 1200},
            ${Math.floor(Math.random() * 15) + 5},
            ${Math.floor(Math.random() * 10) + 3},
            ${4.5 + Math.random() * 0.5},
            ${Math.floor(Math.random() * 5) + 2}
          )
          ON CONFLICT (doctor_id, date) DO NOTHING
        `;
        fixed++;
        console.log(`✓ Business analytics for ${doctor.username}`);
      } catch (e) {
        console.log(`  Skip analytics for ${doctor.username} (exists)`);
      }

      // Feature 6: Patient Journey (add sample data)
      try {
        // Get a patient
        const patient = await prisma.user.findFirst({
          where: { role: 'PATIENT' }
        });

        if (patient) {
          await prisma.$executeRaw`
            INSERT INTO "PatientJourney" (
              patient_id, doctor_id, journey_type, current_step,
              status, started_at
            ) VALUES (
              ${patient.id}, 
              ${doctor.id}, 
              ${'consultation'}, 
              ${'appointment_booked'},
              ${'active'}, 
              ${new Date()}
            )
          `;
          fixed++;
          console.log(`✓ Patient journey for ${doctor.username}`);
        }
      } catch (e) {
        console.log(`  Skip journey for ${doctor.username} (exists or error)`);
      }

      // Feature 9: Revenue Streams (add subscription)
      try {
        await prisma.$executeRaw`
          INSERT INTO "DoctorSubscription" (
            doctor_id, plan_id, status, current_period_start,
            current_period_end, auto_renew
          ) VALUES (
            ${doctor.id}, 
            ${2}, 
            ${'active'}, 
            ${new Date()},
            ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}, 
            true
          )
        `;
        fixed++;
        console.log(`✓ Subscription for ${doctor.username}`);
      } catch (e) {
        console.log(`  Skip subscription for ${doctor.username} (exists or error)`);
      }
    }

    console.log(`\n✅ Applied ${fixed} corrections`);

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedCorrections();
