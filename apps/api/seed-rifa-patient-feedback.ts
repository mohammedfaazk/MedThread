import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedRifaPatientFeedback() {
  console.log('🏥 Seeding patient feedback for Dr. Rifa...\n');

  try {
    // Get Dr. Rifa
    const rifa = await prisma.user.findFirst({
      where: { username: 'dr.rifa.hassan' }
    });

    if (!rifa) {
      console.log('❌ Dr. Rifa not found');
      return;
    }

    // Get some patients
    const patients = await prisma.user.findMany({
      where: { role: 'PATIENT' },
      take: 15
    });

    if (patients.length === 0) {
      console.log('❌ No patients found');
      return;
    }

    console.log(`Found ${patients.length} patients\n`);

    // Create realistic patient feedback data
    const feedbackData = [
      // High success cases (78% cure rate as shown in admin)
      { status: 'CURED', rating: 5.0 },
      { status: 'CURED', rating: 4.8 },
      { status: 'CURED', rating: 4.9 },
      { status: 'CURED', rating: 4.7 },
      { status: 'CURED', rating: 5.0 },
      { status: 'CURED', rating: 4.6 },
      { status: 'CURED', rating: 4.8 },
      { status: 'CURED', rating: 4.9 },
      { status: 'IMPROVED', rating: 4.5 },
      { status: 'IMPROVED', rating: 4.3 },
      { status: 'IMPROVED', rating: 4.4 },
      { status: 'NOT_YET', rating: 4.0 },
      { status: 'NOT_YET', rating: 3.8 },
      { status: 'CONSULT_NEW_DOCTOR', rating: 2.5 },
      { status: 'CONSULT_NEW_DOCTOR', rating: 2.8 }
    ];

    // Create feedback records
    for (let i = 0; i < feedbackData.length && i < patients.length; i++) {
      const patient = patients[i];
      const feedback = feedbackData[i];

      await prisma.patientFeedback.create({
        data: {
          patientId: patient.id,
          doctorId: rifa.id,
          status: feedback.status,
          rating: feedback.rating,
          feedback: `Treatment feedback for ${feedback.status.toLowerCase()} case`,
          communicationRating: feedback.rating,
          professionalismRating: feedback.rating,
          treatmentEffectivenessRating: feedback.rating,
          feedbackCount: 1,
          lastFeedbackAt: new Date(),
          curedAt: feedback.status === 'CURED' ? new Date() : null,
          wasClinicVisit: Math.random() > 0.5
        }
      });

      console.log(`✅ Created feedback: ${feedback.status} (${feedback.rating}⭐) from ${patient.username}`);
    }

    // Recalculate portfolio score
    console.log('\n🔄 Recalculating portfolio score...');
    
    const doctor = await prisma.user.findUnique({
      where: { id: rifa.id },
      select: {
        posts: { select: { id: true } },
        comments: { select: { id: true } },
        appointmentsAsDoctor: { select: { id: true, status: true } },
        patientFeedbacks: { select: { rating: true, status: true } }
      }
    });

    if (doctor) {
      const totalPosts = doctor.posts.length;
      const totalComments = doctor.comments.length;
      const totalAppointments = doctor.appointmentsAsDoctor.length;
      
      const treatmentOutcomes = doctor.patientFeedbacks.map(f => f.status).filter(Boolean);
      const successfulTreatments = treatmentOutcomes.filter(o => o === 'CURED' || o === 'IMPROVED').length;
      const curedCount = treatmentOutcomes.filter(o => o === 'CURED').length;
      const treatmentSuccessRate = treatmentOutcomes.length > 0 
        ? Math.round((successfulTreatments / treatmentOutcomes.length) * 100)
        : 0;

      const ratings = doctor.patientFeedbacks.map(f => f.rating).filter(Boolean);
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length)
        : 0;

      const conversionRate = (totalPosts + totalComments) > 0
        ? Math.round((totalAppointments / (totalPosts + totalComments)) * 100)
        : 0;

      const portfolioScore = Math.round(
        (treatmentSuccessRate * 0.4) + // 40% weight on treatment success
        (avgRating * 20 * 0.3) + // 30% weight on rating (scaled to 100)
        (Math.min(conversionRate, 100) * 0.2) + // 20% weight on conversion
        (Math.min((totalPosts + totalComments) / 10, 10) * 0.1) // 10% weight on activity
      );

      // Update DoctorPerformance
      await prisma.doctorPerformance.update({
        where: { doctorId: rifa.id },
        data: {
          portfolioScore,
          totalPatientsHelped: doctor.patientFeedbacks.length,
          curedPatientCount: curedCount,
          helpfulnessScore: avgRating,
          totalRatings: ratings.length
        }
      });

      console.log('\n📊 NEW CALCULATED VALUES:');
      console.log(`   Portfolio Score: ${portfolioScore}/100`);
      console.log(`   Treatment Success Rate: ${treatmentSuccessRate}%`);
      console.log(`   Cure Rate: ${Math.round((curedCount / treatmentOutcomes.length) * 100)}%`);
      console.log(`   Avg Rating: ${avgRating.toFixed(1)}/5.0`);
      console.log(`   Total Feedbacks: ${treatmentOutcomes.length}`);
      console.log(`   Cured: ${curedCount}, Improved: ${treatmentOutcomes.filter(o => o === 'IMPROVED').length}`);
    }

    console.log('\n✅ Patient feedback seeded successfully!');
    console.log('Now both admin dashboard and public profile will show the same values.');

  } catch (error) {
    console.error('❌ Error seeding patient feedback:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedRifaPatientFeedback();