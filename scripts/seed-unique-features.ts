/**
 * 🌱 SEED UNIQUE FEATURES DATA
 * 
 * Creates sample data to demonstrate the unique features
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding unique features data...\n');

  // 1. Create sample symptom reports for outbreak detection
  console.log('📊 Creating symptom reports...');
  
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata'];
  const symptoms = [
    ['fever', 'headache', 'joint pain', 'rash'],
    ['fever', 'cough', 'fatigue', 'sore throat'],
    ['diarrhea', 'vomiting', 'stomach pain'],
    ['fever', 'chills', 'sweating', 'headache']
  ];

  for (let i = 0; i < 50; i++) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const symptomSet = symptoms[Math.floor(Math.random() * symptoms.length)];
    
    await prisma.symptomReport.create({
      data: {
        symptoms: symptomSet,
        city,
        state: 'Maharashtra',
        country: 'India',
        pincode: `40000${Math.floor(Math.random() * 10)}`,
        severity: ['HIGH', 'MEDIUM', 'LOW'][Math.floor(Math.random() * 3)],
        reportedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    });
  }
  
  console.log('✅ Created 50 symptom reports\n');

  // 2. Create doctor specializations
  console.log('👨‍⚕️ Creating doctor specializations...');
  
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    take: 10
  });

  const conditions = [
    'Type 2 Diabetes',
    'Hypertension',
    'Migraine',
    'Dengue',
    'COVID-19',
    'Influenza',
    'Asthma',
    'Arthritis'
  ];

  for (const doctor of doctors) {
    // Give each doctor 2-3 specializations
    const numSpecializations = 2 + Math.floor(Math.random() * 2);
    
    for (let i = 0; i < numSpecializations; i++) {
      const condition = conditions[Math.floor(Math.random() * conditions.length)];
      const patientCount = 10 + Math.floor(Math.random() * 90);
      const curedCount = Math.floor(patientCount * (0.6 + Math.random() * 0.3));
      const improvedCount = Math.floor((patientCount - curedCount) * 0.7);
      
      try {
        await prisma.doctorSpecialization.create({
          data: {
            doctorId: doctor.id,
            condition,
            patientCount,
            totalTreatments: patientCount,
            curedCount,
            improvedCount,
            successRate: ((curedCount + improvedCount * 0.5) / patientCount) * 100,
            avgRecoveryDays: 7 + Math.floor(Math.random() * 14)
          }
        });
      } catch (error) {
        // Skip if already exists
      }
    }
  }
  
  console.log('✅ Created doctor specializations\n');

  // 3. Create sample outbreak alerts
  console.log('🚨 Creating outbreak alerts...');
  
  const diseases = ['Dengue', 'Influenza', 'COVID-19'];
  
  for (const disease of diseases) {
    const city = cities[Math.floor(Math.random() * cities.length)];
    const affectedCount = 15 + Math.floor(Math.random() * 35);
    const growthRate = 20 + Math.random() * 60;
    
    await prisma.outbreakAlert.create({
      data: {
        disease,
        location: city,
        city,
        state: 'Maharashtra',
        severity: growthRate > 50 ? 'HIGH' : growthRate > 30 ? 'MEDIUM' : 'LOW',
        affectedCount,
        growthRate,
        alertMessage: `⚠️ ${disease} Alert: ${affectedCount} cases reported in ${city} (↑ ${growthRate.toFixed(0)}% this week)`,
        actionItems: [
          'Monitor your symptoms closely',
          'Maintain good hygiene practices',
          'Stay hydrated',
          'Consult a doctor if symptoms worsen',
          'Use mosquito repellent (for Dengue)',
          'Wear a mask in public places'
        ],
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });
  }
  
  console.log('✅ Created outbreak alerts\n');

  // 4. Create symptom clusters
  console.log('📍 Creating symptom clusters...');
  
  for (const city of cities) {
    await prisma.symptomCluster.create({
      data: {
        id: `${city}-7_DAYS`,
        symptoms: {
          fever: 25,
          headache: 20,
          'joint pain': 15,
          cough: 18,
          fatigue: 22
        },
        location: city,
        city,
        state: 'Maharashtra',
        patientCount: 25,
        timeWindow: '7_DAYS',
        severity: 'WARNING',
        predictedDisease: 'Dengue',
        confidence: 0.75,
        growthRate: 35.5
      }
    });
  }
  
  console.log('✅ Created symptom clusters\n');

  // 5. Create community health scores
  console.log('🏘️ Creating community health scores...');
  
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    await prisma.communityHealthScore.create({
      data: {
        location: city,
        city,
        state: 'Maharashtra',
        healthScore: 60 + Math.random() * 30,
        activeUsers: 500 + Math.floor(Math.random() * 1500),
        doctorDensity: 2 + Math.random() * 3,
        avgResponseTime: 30 + Math.floor(Math.random() * 60),
        commonIssues: [
          { issue: 'Seasonal Flu', count: 45 },
          { issue: 'Allergies', count: 32 },
          { issue: 'Headaches', count: 28 }
        ],
        rank: i + 1,
        trendDirection: ['IMPROVING', 'STABLE', 'DECLINING'][Math.floor(Math.random() * 3)]
      }
    });
  }
  
  console.log('✅ Created community health scores\n');

  // 6. Create health challenges
  console.log('🏆 Creating health challenges...');
  
  const challenges = [
    {
      title: '10,000 Steps Challenge',
      description: 'Walk 10,000 steps every day for a week',
      type: 'STEPS',
      goal: 10000,
      unit: 'steps'
    },
    {
      title: 'Hydration Challenge',
      description: 'Drink 8 glasses of water daily',
      type: 'WATER',
      goal: 8,
      unit: 'glasses'
    },
    {
      title: 'Sleep Well Challenge',
      description: 'Get 7-8 hours of sleep every night',
      type: 'SLEEP',
      goal: 8,
      unit: 'hours'
    }
  ];

  for (const challenge of challenges) {
    await prisma.healthChallenge.create({
      data: {
        ...challenge,
        participants: [],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: [
          { type: 'BADGE', name: 'Health Champion' },
          { type: 'COINS', amount: 100 }
        ],
        leaderboard: []
      }
    });
  }
  
  console.log('✅ Created health challenges\n');

  // 7. Update doctor performance metrics
  console.log('📈 Updating doctor performance metrics...');
  
  for (const doctor of doctors) {
    const specializations = await prisma.doctorSpecialization.findMany({
      where: { doctorId: doctor.id }
    });

    const totalPatients = specializations.reduce((sum, s) => sum + s.patientCount, 0);
    const totalCured = specializations.reduce((sum, s) => sum + s.curedCount, 0);
    
    await prisma.doctorPerformance.upsert({
      where: { doctorId: doctor.id },
      create: {
        doctorId: doctor.id,
        totalPatientsHelped: totalPatients,
        curedPatientCount: totalCured,
        avgResponseTime: 30 + Math.floor(Math.random() * 120),
        helpfulnessScore: 3.5 + Math.random() * 1.5,
        totalRatings: 10 + Math.floor(Math.random() * 90),
        portfolioScore: (totalCured / totalPatients) * 100
      },
      update: {
        totalPatientsHelped: totalPatients,
        curedPatientCount: totalCured,
        portfolioScore: (totalCured / totalPatients) * 100
      }
    });
  }
  
  console.log('✅ Updated doctor performance metrics\n');

  console.log('🎉 Seeding completed successfully!\n');
  console.log('📊 Summary:');
  console.log('  - 50 symptom reports');
  console.log(`  - ${doctors.length * 2} doctor specializations`);
  console.log('  - 3 outbreak alerts');
  console.log('  - 5 symptom clusters');
  console.log('  - 5 community health scores');
  console.log('  - 3 health challenges');
  console.log(`  - ${doctors.length} doctor performance updates`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
