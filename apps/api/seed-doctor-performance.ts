/**
 * Seed Doctor Performance Data
 * Creates realistic doctor performance metrics for analytics
 */

import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedDoctorPerformance() {
  console.log('🏥 Seeding Doctor Performance Data...\n');

  try {
    // Get all verified doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        doctorVerificationStatus: 'APPROVED'
      }
    });

    console.log(`✅ Found ${doctors.length} verified doctors`);

    if (doctors.length === 0) {
      console.log('⚠️  No verified doctors found. Please verify some doctors first.');
      return;
    }

    // Delete existing performance data
    await prisma.doctorPerformance.deleteMany({});
    console.log('🗑️  Cleared old performance data');

    // Create performance data for each doctor
    for (const doctor of doctors) {
      const totalResponses = Math.floor(Math.random() * 100) + 20; // 20-120 responses
      const totalPatientsHelped = Math.floor(totalResponses * 0.8); // 80% helped
      const avgResponseTime = Math.floor(Math.random() * 60) + 10; // 10-70 minutes
      const helpfulnessScore = (Math.random() * 2 + 3).toFixed(1); // 3.0-5.0
      const totalRatings = Math.floor(Math.random() * 50) + 10; // 10-60 ratings
      const activeEngagementScore = Math.floor(Math.random() * 100) + 50; // 50-150
      const appointmentsCompleted = Math.floor(Math.random() * 30) + 5; // 5-35
      const appointmentsCancelled = Math.floor(Math.random() * 5); // 0-5

      await prisma.doctorPerformance.create({
        data: {
          doctorId: doctor.id,
          totalResponses,
          totalPatientsHelped,
          avgResponseTime,
          helpfulnessScore: parseFloat(helpfulnessScore),
          totalRatings,
          appointmentsCompleted,
          appointmentsCancelled,
          activeEngagementScore,
          lastActiveAt: new Date(),
          calculatedAt: new Date(),
          metadata: {}
        }
      });
    }

    console.log(`✅ Created performance data for ${doctors.length} doctors\n`);

    // Show top 5 doctors
    const topDoctors = await prisma.doctorPerformance.findMany({
      take: 5,
      orderBy: { helpfulnessScore: 'desc' },
      include: {
        doctor: {
          select: {
            username: true,
            specialty: true
          }
        }
      }
    });

    console.log('🏆 Top 5 Doctors:');
    topDoctors.forEach((perf: any, index) => {
      console.log(`   ${index + 1}. ${perf.doctor.username} (${perf.doctor.specialty})`);
      console.log(`      Rating: ${perf.helpfulnessScore}/5.0 | Helped: ${perf.totalPatientsHelped} patients`);
    });

    console.log('\n✅ Doctor performance data seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding doctor performance:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDoctorPerformance();
