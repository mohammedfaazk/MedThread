/**
 * Seed Symptom Analytics Data
 * 
 * This script seeds realistic symptom report data into the database
 * so the analytics page can display real-time data.
 * 
 * Run: npx tsx apps/api/seed-symptom-analytics-data.ts
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

const symptoms = [
  'Fever', 'Cough', 'Headache', 'Fatigue', 'Sore Throat',
  'Body Ache', 'Nausea', 'Dizziness', 'Chest Pain', 'Shortness of Breath'
];

const regions = [
  'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
  'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow'
];

async function seedSymptomData() {
  console.log('🌱 Seeding symptom analytics data...');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 50
    });

    if (users.length === 0) {
      console.log('❌ No users found. Please create some users first.');
      return;
    }

    console.log(`Found ${users.length} users`);

    // Create symptom reports for the last 7 days
    const reports = [];
    const now = new Date();

    for (let day = 0; day < 7; day++) {
      const date = new Date(now);
      date.setDate(date.getDate() - day);

      // Create 20-50 reports per day
      const reportsPerDay = Math.floor(Math.random() * 30) + 20;

      for (let i = 0; i < reportsPerDay; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const symptom = symptoms[Math.floor(Math.random() * symptoms.length)];
        const region = regions[Math.floor(Math.random() * regions.length)];
        const severity = ['MILD', 'MODERATE', 'SEVERE'][Math.floor(Math.random() * 3)];

        reports.push({
          userId: user.id,
          symptom,
          severity,
          region,
          reportedAt: date,
          metadata: {
            source: 'web',
            userAgent: 'Mozilla/5.0'
          }
        });
      }
    }

    // Insert all reports
    console.log(`Creating ${reports.length} symptom reports...`);
    
    await prisma.symptomReport.createMany({
      data: reports,
      skipDuplicates: true
    });

    console.log('✅ Symptom analytics data seeded successfully!');
    console.log(`   - ${reports.length} symptom reports created`);
    console.log(`   - Covering last 7 days`);
    console.log(`   - ${symptoms.length} different symptoms`);
    console.log(`   - ${regions.length} regions`);

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedSymptomData();
