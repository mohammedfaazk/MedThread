import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedAnalytics() {
  console.log('🌱 Seeding analytics data...');

  // Sample symptoms
  const symptoms = [
    'fever', 'cough', 'headache', 'fatigue', 'sore throat',
    'body aches', 'nausea', 'dizziness', 'chest pain', 'shortness of breath'
  ];

  const regions = ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix'];
  const severities = ['mild', 'moderate', 'severe'];

  // Create symptom reports
  console.log('Creating symptom reports...');
  for (let i = 0; i < 100; i++) {
    const randomSymptoms = Array.from(
      { length: Math.floor(Math.random() * 3) + 1 },
      () => ({
        name: symptoms[Math.floor(Math.random() * symptoms.length)],
        severity: severities[Math.floor(Math.random() * severities.length)]
      })
    );

    await prisma.symptomReport.create({
      data: {
        sessionId: `session-${i}`,
        symptoms: randomSymptoms,
        location: {
          city: regions[Math.floor(Math.random() * regions.length)],
          country: 'USA'
        },
        age: Math.floor(Math.random() * 60) + 18,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        temperature: Math.random() > 0.3 ? 98 + Math.random() * 5 : null,
        duration: ['1 day', '2 days', '3 days', '1 week'][Math.floor(Math.random() * 4)],
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
      }
    });
  }

  // Create health trends
  console.log('Creating health trends...');
  for (const symptom of symptoms.slice(0, 5)) {
    await prisma.healthTrend.create({
      data: {
        symptom,
        count: Math.floor(Math.random() * 50) + 10,
        region: regions[Math.floor(Math.random() * regions.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        trendDirection: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
        percentChange: (Math.random() - 0.5) * 40,
        timeWindow: 'daily'
      }
    });
  }

  // Create geographic health data
  console.log('Creating geographic health data...');
  for (const region of regions) {
    const topSymptoms = symptoms.slice(0, 3).map(s => ({
      symptom: s,
      count: Math.floor(Math.random() * 30) + 5
    }));

    await prisma.geographicHealthData.create({
      data: {
        region,
        topSymptoms,
        totalReports: Math.floor(Math.random() * 100) + 20,
        alertLevel: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)]
      }
    });
  }

  // Get some doctors for performance data
  const doctors = await prisma.user.findMany({
    where: { role: 'DOCTOR' },
    take: 10
  });

  if (doctors.length > 0) {
    console.log('Creating doctor performance data...');
    for (const doctor of doctors) {
      await prisma.doctorPerformance.create({
        data: {
          doctorId: doctor.id,
          totalResponses: Math.floor(Math.random() * 100) + 10,
          totalPatientsHelped: Math.floor(Math.random() * 50) + 5,
          avgResponseTime: Math.floor(Math.random() * 120) + 15,
          helpfulnessScore: 3 + Math.random() * 2,
          totalRatings: Math.floor(Math.random() * 50) + 5,
          appointmentsCompleted: Math.floor(Math.random() * 30) + 5,
          appointmentsCancelled: Math.floor(Math.random() * 5),
          activeEngagementScore: Math.random() * 100,
          lastActiveAt: new Date()
        }
      });
    }
  }

  // Create platform metrics for the last 30 days
  console.log('Creating platform metrics...');
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    await prisma.platformMetrics.create({
      data: {
        date,
        totalUsers: 1000 + i * 10,
        activeUsers: Math.floor(Math.random() * 200) + 50,
        newUsers: Math.floor(Math.random() * 20) + 5,
        totalDoctors: 100 + i,
        activeDoctors: Math.floor(Math.random() * 30) + 10,
        newDoctors: Math.floor(Math.random() * 3),
        totalPosts: Math.floor(Math.random() * 50) + 10,
        totalAppointments: Math.floor(Math.random() * 30) + 5,
        totalSymptomReports: Math.floor(Math.random() * 40) + 10,
        peakUsageHour: Math.floor(Math.random() * 24)
      }
    });
  }

  console.log('✅ Analytics data seeded successfully!');
}

seedAnalytics()
  .catch((e) => {
    console.error('Error seeding analytics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
