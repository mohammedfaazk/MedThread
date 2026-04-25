import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function debugRifaFeedbacks() {
  try {
    const rifa = await prisma.user.findFirst({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!rifa) {
      console.log('❌ Dr. Rifa not found');
      return;
    }

    console.log(`Found Dr. Rifa: ${rifa.id}\n`);

    // Count feedbacks
    const feedbackCount = await prisma.patientFeedback.count({
      where: { doctorId: rifa.id }
    });

    console.log(`Total feedbacks for Dr. Rifa: ${feedbackCount}\n`);

    // Get all feedbacks
    const feedbacks = await prisma.patientFeedback.findMany({
      where: { doctorId: rifa.id },
      select: {
        id: true,
        status: true,
        rating: true,
        patientId: true,
        createdAt: true
      }
    });

    console.log('Feedbacks:');
    feedbacks.forEach((f, i) => {
      console.log(`${i + 1}. Status: ${f.status}, Rating: ${f.rating}, Created: ${f.createdAt}`);
    });

    if (feedbacks.length > 0) {
      const statuses: Record<string, number> = {};
      feedbacks.forEach(f => {
        statuses[f.status] = (statuses[f.status] || 0) + 1;
      });

      console.log('\nStatus breakdown:');
      Object.entries(statuses).forEach(([status, count]) => {
        console.log(`  ${status}: ${count}`);
      });

      const avgRating = feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length;
      console.log(`\nAverage rating: ${avgRating.toFixed(1)}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugRifaFeedbacks();
