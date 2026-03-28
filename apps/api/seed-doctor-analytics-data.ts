import { PrismaClient } from '@medthread/database';

const prisma = new PrismaClient();

async function seedDoctorAnalytics() {
  console.log('🌱 Seeding analytics data for Dr. dr.rifa.hassan...');

  // Find the doctor
  const doctor = await prisma.user.findFirst({
    where: {
      username: 'dr.rifa.hassan'
    }
  });

  if (!doctor) {
    console.error('❌ Doctor dr.rifa.hassan not found!');
    return;
  }

  console.log(`✅ Found doctor: ${doctor.username} (ID: ${doctor.id})`);

  // 1. Create Treatment Outcomes (Patient Feedback)
  console.log('\n📊 Creating treatment outcomes...');
  const treatmentOutcomes = [
    { status: 'CURED', count: 45 },
    { status: 'NOT_YET', count: 28 },
    { status: 'SWITCHED_DOCTOR', count: 7 }
  ];

  for (const outcome of treatmentOutcomes) {
    for (let i = 0; i < outcome.count; i++) {
      const daysAgo = Math.floor(Math.random() * 180); // Last 6 months
      const createdAt = new Date();
      createdAt.setDate(createdAt.getDate() - daysAgo);

      const curedAt = outcome.status === 'CURED' ? new Date(createdAt.getTime() + (Math.random() * 30 * 24 * 60 * 60 * 1000)) : null;

      await prisma.patientFeedback.create({
        data: {
          doctorId: doctor.id,
          patientId: doctor.id, // Using doctor ID as placeholder
          status: outcome.status as any,
          wasClinicVisit: Math.random() > 0.5,
          createdAt,
          curedAt
        }
      });
    }
  }
  console.log('✅ Created treatment outcomes');

  // 2. Create Posts Over Time
  console.log('\n📝 Creating posts...');
  const postsPerMonth = [
    { month: 0, count: 8 },  // Current month
    { month: 1, count: 12 },
    { month: 2, count: 15 },
    { month: 3, count: 10 },
    { month: 4, count: 14 },
    { month: 5, count: 11 },
    { month: 6, count: 9 },
    { month: 7, count: 13 },
    { month: 8, count: 16 },
    { month: 9, count: 12 },
    { month: 10, count: 10 },
    { month: 11, count: 8 }
  ];

  for (const monthData of postsPerMonth) {
    for (let i = 0; i < monthData.count; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthData.month);
      date.setDate(Math.floor(Math.random() * 28) + 1);

      await prisma.post.create({
        data: {
          title: `Medical Insight ${Math.random().toString(36).substring(7)}`,
          content: 'Sample medical content for analytics',
          authorId: doctor.id,
          communityId: 'default-community-id',
          createdAt: date
        }
      });
    }
  }
  console.log('✅ Created posts');

  // 3. Create Comments Over Time
  console.log('\n💬 Creating comments...');
  const commentsPerMonth = [
    { month: 0, count: 25 },
    { month: 1, count: 32 },
    { month: 2, count: 28 },
    { month: 3, count: 35 },
    { month: 4, count: 30 },
    { month: 5, count: 27 },
    { month: 6, count: 22 },
    { month: 7, count: 29 },
    { month: 8, count: 33 },
    { month: 9, count: 26 },
    { month: 10, count: 24 },
    { month: 11, count: 20 }
  ];

  for (const monthData of commentsPerMonth) {
    for (let i = 0; i < monthData.count; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthData.month);
      date.setDate(Math.floor(Math.random() * 28) + 1);

      await prisma.comment.create({
        data: {
          content: 'Sample medical comment for analytics',
          authorId: doctor.id,
          postId: 'sample-post-id',
          createdAt: date
        }
      });
    }
  }
  console.log('✅ Created comments');

  // 4. Create Conversion Rate Data
  console.log('\n📈 Creating conversion data...');
  const conversionsPerMonth = [
    { month: 0, total: 45, converted: 32 },
    { month: 1, total: 52, converted: 38 },
    { month: 2, total: 48, converted: 35 },
    { month: 3, total: 55, converted: 42 },
    { month: 4, total: 50, converted: 36 },
    { month: 5, total: 47, converted: 34 },
    { month: 6, total: 42, converted: 30 },
    { month: 7, total: 49, converted: 37 },
    { month: 8, total: 53, converted: 40 },
    { month: 9, total: 46, converted: 33 },
    { month: 10, total: 44, converted: 31 },
    { month: 11, total: 40, converted: 28 }
  ];

  for (const monthData of conversionsPerMonth) {
    for (let i = 0; i < monthData.total; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthData.month);
      date.setDate(Math.floor(Math.random() * 28) + 1);

      await prisma.commentConversion.create({
        data: {
          commentId: `comment-${Math.random().toString(36).substring(7)}`,
          doctorId: doctor.id,
          patientId: doctor.id,
          postId: `post-${Math.random().toString(36).substring(7)}`,
          messageClicked: i < monthData.converted,
          createdAt: date
        }
      });
    }
  }
  console.log('✅ Created conversion data');

  // 5. Create/Update Doctor Performance (Portfolio Score)
  console.log('\n🏆 Creating portfolio score...');
  await prisma.doctorPerformance.upsert({
    where: { doctorId: doctor.id },
    create: {
      doctorId: doctor.id,
      portfolioScore: 87.5,
      responseTime: 15,
      patientSatisfaction: 4.6,
      treatmentSuccessRate: 92.3,
      updatedAt: new Date()
    },
    update: {
      portfolioScore: 87.5,
      responseTime: 15,
      patientSatisfaction: 4.6,
      treatmentSuccessRate: 92.3,
      updatedAt: new Date()
    }
  });
  console.log('✅ Created portfolio score');

  console.log('\n✨ Analytics data seeding complete!');
  console.log('\n📊 Summary:');
  console.log(`   - Treatment Outcomes: 80 records`);
  console.log(`   - Posts: 138 records`);
  console.log(`   - Comments: 331 records`);
  console.log(`   - Conversions: 571 records`);
  console.log(`   - Portfolio Score: 87.5/100`);
}

seedDoctorAnalytics()
  .catch((e) => {
    console.error('❌ Error seeding analytics data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
